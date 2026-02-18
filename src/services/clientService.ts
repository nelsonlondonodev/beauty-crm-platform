import { supabase } from '../lib/supabase';
import type { Client, BonusStatus } from '../types';
import { addMonths, isPast } from 'date-fns';

// Helper to map DB row to Client type
const mapDbToClient = (row: any): Client => {
    // Calculo de vencimiento: created_at + 6 meses
    const createdAt = row.created_at ? new Date(row.created_at) : new Date();
    const vencimientoDate = addMonths(createdAt, 6);
    const isVencido = isPast(vencimientoDate) && !row.canjeado;

    let estado: BonusStatus = 'pendiente';
    if (row.canjeado) estado = 'reclamado';
    else if (isVencido) estado = 'vencido';

    return {
        id: row.id,
        nombre: row.nombre || 'Sin Nombre',
        email: row.email || '',
        telefono: row.whatsapp || '',
        fecha_nacimiento: row.birthday || '',
        bono_estado: estado,
        bono_fecha_vencimiento: vencimientoDate.toISOString().split('T')[0]
    };
};

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clientes_fidelizacion') // Tabla real
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapDbToClient);
};

export const createClient = async (clientData: Omit<Client, 'id' | 'bono_estado' | 'bono_fecha_vencimiento'>): Promise<Client> => {
    // Nota: La creación debería idealmente pasar por n8n o respetar la estructura exacta
    // Aquí hacemos un insert simple a la tabla existente
    const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .insert([{
      nombre: clientData.nombre,
      email: clientData.email,
      whatsapp: clientData.telefono,
      birthday: clientData.fecha_nacimiento,
      // created_at se genera auto
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbToClient(data);
};

export const updateClient = async (id: string | number, updates: Partial<Client>): Promise<Client> => {
  // Map updates back to DB columns
  const dbUpdates: any = {};
  if (updates.nombre) dbUpdates.nombre = updates.nombre;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.telefono) dbUpdates.whatsapp = updates.telefono;
  if (updates.fecha_nacimiento) dbUpdates.birthday = updates.fecha_nacimiento;
  
  // Bono updates (manual override)
  if (updates.bono_estado === 'reclamado') {
      dbUpdates.canjeado = true;
      dbUpdates.fecha_canje = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbToClient(data);
};

export const deleteClient = async (id: string | number): Promise<void> => {
  const { error } = await supabase
    .from('clientes_fidelizacion')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
