import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/utils';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Client,
  BonusStatus,
  ClientBonusDisplay,
  ClientDbRow,
  BonoDbRow,
  FacturaWithItems,
  Result,
} from '../types';
import { addMonths } from 'date-fns';
import { logger } from '../lib/logger';
import { getStandardExpirationDate, getBirthdayExpirationDate, hasExpired } from '../lib/dateUtils';

// --- Utilidades de Dominio ---

function calculateBonusStatus(bono: BonoDbRow): { status: BonusStatus; expirationDate: Date } {
  const isBirthday = bono.tipo === 'Cumpleaños';
  const expirationDate = isBirthday 
    ? getBirthdayExpirationDate(bono.created_at) 
    : getStandardExpirationDate(bono.created_at, 6);

  if (bono.estado === 'Canjeado') return { status: 'reclamado', expirationDate };
  if (bono.estado === 'Expirado' || hasExpired(expirationDate.toISOString())) {
    return { status: 'vencido', expirationDate };
  }
  
  if (!isBirthday) {
    const alertDate = addMonths(new Date(bono.created_at), 5);
    if (hasExpired(alertDate.toISOString())) {
      return { status: 'alerta_5_meses', expirationDate };
    }
  }
  
  return { status: 'pendiente', expirationDate };
}

const processClientBonuses = (bonosRow?: BonoDbRow[]) => {
  if (!bonosRow || bonosRow.length === 0) {
    return { activeBonus: null, displayBonuses: [] as ClientBonusDisplay[] };
  }

  const sortedBonos = [...bonosRow].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const displayBonuses: ClientBonusDisplay[] = sortedBonos.map((b) => {
    const { status, expirationDate } = calculateBonusStatus(b);
    return {
      id: b.id,
      tipo: b.tipo || 'Bienvenida',
      codigo: b.codigo || '',
      estado: status,
      fecha_vencimiento: expirationDate.toISOString().split('T')[0],
    };
  });

  const activeBonoRaw = sortedBonos.find((b) => b.estado === 'Pendiente') || sortedBonos[0];
  const { status, expirationDate } = calculateBonusStatus(activeBonoRaw);

  return {
    activeBonus: { ...activeBonoRaw, status, expirationDate },
    displayBonuses,
  };
};

const mapDbToClient = (row: ClientDbRow): Client => {
  const { activeBonus, displayBonuses } = processClientBonuses(row.bonos);

  return {
    id: row.id,
    nombre: row.nombre || 'Sin Nombre',
    email: row.email || '',
    telefono: row.whatsapp || '',
    fecha_nacimiento: row.birthday || '',
    bono_estado: activeBonus ? activeBonus.status : 'sin_bono',
    bono_fecha_vencimiento: activeBonus ? activeBonus.expirationDate.toISOString().split('T')[0] : '',
    bono_tipo: activeBonus?.tipo,
    bonos_historial: displayBonuses,
    notas: row.notas || '',
  };
};

// --- Funciones de Servicio ---

export const getClients = async (): Promise<Result<Client[]>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .select('*, bonos(*)')
        .order('created_at', { ascending: false }) as unknown as Promise<{ data: ClientDbRow[] | null; error: PostgrestError | null }>
    );

    if (error) throw error;
    return { success: true, data: (data || []).map(mapDbToClient) };
  } catch (err: any) {
    logger.error('Error fetching clients', err, 'ClientService');
    return { success: false, error: err.message || 'Error al cargar clientes' };
  }
};

export const getClientById = async (id: string): Promise<Result<Client>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .select('*, bonos(*)')
        .eq('id', id)
        .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
    );

    if (error || !data) throw error || new Error('Cliente no encontrado');
    return { success: true, data: mapDbToClient(data) };
  } catch (err: any) {
    logger.error(`Error fetching client ${id}`, err, 'ClientService');
    return { success: false, error: err.message };
  }
};

export const getClientFinancialHistory = async (clientId: string): Promise<Result<FacturaWithItems[]>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('facturas')
        .select('*, factura_items(*)')
        .eq('cliente_id', clientId)
        .order('fecha_venta', { ascending: false }) as unknown as Promise<{ data: FacturaWithItems[] | null; error: PostgrestError | null }>
    );

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    logger.error(`Error fetching financial history for client ${clientId}`, err, 'ClientService');
    return { success: false, error: `No se pudo cargar el historial: ${err.message}` };
  }
};

export const createClient = async (
  clientData: Omit<Client, 'id' | 'bono_estado' | 'bono_fecha_vencimiento'>
): Promise<Result<Client>> => {
  try {
    const sanitizedName = clientData.nombre.trim();
    const sanitizedPhone = clientData.telefono.replace(/\D/g, '');

    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .insert([{
          nombre: sanitizedName,
          email: clientData.email,
          whatsapp: sanitizedPhone,
          birthday: clientData.fecha_nacimiento,
          notas: clientData.notas || '',
        }])
        .select('*, bonos(*)')
        .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
    );

    if (error || !data) throw error || new Error('Error al crear cliente');
    return { success: true, data: mapDbToClient(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

async function redeemActiveBonusForClient(clientId: string): Promise<void> {
  const { data: bonos } = await fetchWithTimeout(
    supabase
      .from('bonos')
      .select('id')
      .eq('client_id', clientId)
      .eq('estado', 'Pendiente')
      .limit(1) as unknown as Promise<{ data: { id: string }[] | null; error: PostgrestError | null }>
  );

  if (bonos && bonos.length > 0) {
    const { error } = await supabase
      .from('bonos')
      .update({ estado: 'Canjeado', fecha_canje: new Date().toISOString() })
      .eq('id', bonos[0].id);

    if (error) {
      logger.warn(`Could not redeem bonus for client ${clientId}`, error, 'ClientService');
    }
  }
}

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Result<Client>> => {
  try {
    const dbUpdates: Partial<ClientDbRow> = {};
    if (updates.nombre) dbUpdates.nombre = updates.nombre;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.telefono) dbUpdates.whatsapp = updates.telefono.replace(/\D/g, '');
    if (updates.fecha_nacimiento) dbUpdates.birthday = updates.fecha_nacimiento;
    if (updates.notas !== undefined) dbUpdates.notas = updates.notas;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('clientes_fidelizacion')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    }

    if (updates.bono_estado === 'reclamado') {
      await redeemActiveBonusForClient(id);
    }

    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .select('*, bonos(*)')
        .eq('id', id)
        .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
    );

    if (error || !data) throw error || new Error('No se pudo recuperar el registro actualizado');
    return { success: true, data: mapDbToClient(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteClient = async (id: string): Promise<Result<void>> => {
  try {
    const { error } = await supabase
      .from('clientes_fidelizacion')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
