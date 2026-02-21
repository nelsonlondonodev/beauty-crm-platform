import { supabase } from '../lib/supabase';
import type { Client, BonusStatus, ClientBonusDisplay, ClientDbRow, BonoDbRow } from '../types';
import { addMonths, isPast } from 'date-fns';

// Helper to process bones
const processClientBonuses = (bonosRow?: BonoDbRow[]) => {
    let activeBonus: BonoDbRow | undefined = undefined;
    let fallbackBonus: BonoDbRow | undefined = undefined;
    let allProcessedBonuses: ClientBonusDisplay[] = [];

    if (bonosRow && Array.isArray(bonosRow) && bonosRow.length > 0) {
        // Sort newest first
        const sortedBonos = [...bonosRow].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        fallbackBonus = sortedBonos[0]; // the latest one
        activeBonus = sortedBonos.find(b => b.estado === 'Pendiente') || fallbackBonus;
        
        allProcessedBonuses = sortedBonos.map(b => {
             const createdAt = new Date(b.created_at);
             const venc = b.fecha_vencimiento ? new Date(b.fecha_vencimiento) : addMonths(createdAt, 6);
             let st: BonusStatus = 'pendiente';
             
             if (b.estado === 'Canjeado') {
                  st = 'reclamado';
             } else if (b.estado === 'Expirado' || isPast(venc)) {
                  st = 'vencido';
             } else {
                  st = 'pendiente';
                  if (isPast(addMonths(createdAt, 5))) {
                      st = 'alerta_5_meses';
                  }
             }
             return {
                 id: b.id,
                 tipo: b.tipo || 'Bienvenida',
                 codigo: b.codigo || '',
                 estado: st,
                 fecha_vencimiento: venc.toISOString().split('T')[0]
             }
        });
    }

    // Keep all active ones (or at least the most recent historical if none are active)
    let displayBonuses = allProcessedBonuses.filter(b => b.estado === 'pendiente' || b.estado === 'alerta_5_meses');
    if (displayBonuses.length === 0 && allProcessedBonuses.length > 0) {
         displayBonuses = [allProcessedBonuses[0]]; // Latest historical
    }

    return { activeBonus, displayBonuses };
};

// Helper to map DB row to Client type
const mapDbToClient = (row: ClientDbRow): Client => {
    const { activeBonus, displayBonuses } = processClientBonuses(row.bonos);

    let estado: BonusStatus = 'vencido';
    let vencimientoDate: Date | null = null;

    if (activeBonus) {
        const createdAt = new Date(activeBonus.created_at);
        vencimientoDate = activeBonus.fecha_vencimiento ? new Date(activeBonus.fecha_vencimiento) : addMonths(createdAt, 6);
        
        if (activeBonus.estado === 'Canjeado') {
             estado = 'reclamado';
        } else if (activeBonus.estado === 'Expirado' || isPast(vencimientoDate)) {
             estado = 'vencido';
        } else {
             estado = 'pendiente';
             // Check 5 month alert
             if (isPast(addMonths(createdAt, 5))) {
                 estado = 'alerta_5_meses';
             }
        }
    } else {
        // Legacy fallback
        const createdAt = row.created_at ? new Date(row.created_at) : new Date();
        vencimientoDate = addMonths(createdAt, 6);
        estado = isPast(vencimientoDate) ? 'vencido' : 'pendiente';
    }

    return {
        id: row.id,
        nombre: row.nombre || 'Sin Nombre',
        email: row.email || '',
        telefono: row.whatsapp || '',
        fecha_nacimiento: row.birthday || '',
        bono_estado: estado,
        bono_fecha_vencimiento: vencimientoDate ? vencimientoDate.toISOString().split('T')[0] : '',
        bono_tipo: activeBonus ? activeBonus.tipo : 'Bienvenida',
        bonos_historial: displayBonuses
    };
};

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .select('*, bonos(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapDbToClient);
};

export const createClient = async (clientData: Omit<Client, 'id' | 'bono_estado' | 'bono_fecha_vencimiento'>): Promise<Client> => {
    const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .insert([{
      nombre: clientData.nombre,
      email: clientData.email,
      whatsapp: clientData.telefono,
      birthday: clientData.fecha_nacimiento,
    }])
    .select('*, bonos(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbToClient(data);
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
  const dbUpdates: Partial<ClientDbRow> = {};
  if (updates.nombre) dbUpdates.nombre = updates.nombre;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.telefono) dbUpdates.whatsapp = updates.telefono;
  if (updates.fecha_nacimiento) dbUpdates.birthday = updates.fecha_nacimiento;
  
  // Update main client fields if there are any
  if (Object.keys(dbUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('clientes_fidelizacion')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);
  }

  // Bono updates (manual override handler)
  if (updates.bono_estado === 'reclamado') {
      // Find the active pendiente bonus and mark it as canjeado
      const { data: bonos } = await supabase.from('bonos').select('id').eq('client_id', id).eq('estado', 'Pendiente').limit(1);
      if (bonos && bonos.length > 0) {
          await supabase.from('bonos')
             .update({ estado: 'Canjeado', fecha_canje: new Date().toISOString() })
             .eq('id', bonos[0].id);
      }
  }

  // Fetch updated fully joined record
  const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .select('*, bonos(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbToClient(data);
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes_fidelizacion')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
