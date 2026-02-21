import { supabase } from '../lib/supabase';
import type { Client, BonusStatus } from '../types';
import { addMonths, isPast } from 'date-fns';

// Helper to map DB row to Client type
const mapDbToClient = (row: any): Client => {
    let activeBonus = null;
    let fallbackBonus = null;

    if (row.bonos && Array.isArray(row.bonos) && row.bonos.length > 0) {
        // Sort newest first
        const sortedBonos = row.bonos.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        fallbackBonus = sortedBonos[0]; // the latest one
        activeBonus = sortedBonos.find((b: any) => b.estado === 'Pendiente') || fallbackBonus;
    }

    let estado: BonusStatus = 'vencido';
    let vencimientoDate = null;

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
        bono_fecha_vencimiento: vencimientoDate ? vencimientoDate.toISOString().split('T')[0] : ''
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
  const dbUpdates: any = {};
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
