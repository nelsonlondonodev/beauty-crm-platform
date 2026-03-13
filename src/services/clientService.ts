import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/utils';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Client,
  BonusStatus,
  ClientBonusDisplay,
  ClientDbRow,
  BonoDbRow,
  Factura,
} from '../types';
import { addMonths } from 'date-fns';
import { logger } from '../lib/logger';
import { getStandardExpirationDate, getBirthdayExpirationDate, hasExpired } from '../lib/dateUtils';

// --- Utilidades de Dominio ---

/**
 * Calcula el estado de un bono basándose en sus fechas y estado actual.
 */
function calculateBonusStatus(bono: BonoDbRow): { status: BonusStatus; expirationDate: Date } {
  const isBirthday = bono.tipo === 'Cumpleaños';
  const expirationDate = isBirthday 
    ? getBirthdayExpirationDate(bono.created_at) 
    : getStandardExpirationDate(bono.created_at, 6);

  if (bono.estado === 'Canjeado') return { status: 'reclamado', expirationDate };
  if (bono.estado === 'Expirado' || hasExpired(expirationDate.toISOString())) {
    return { status: 'vencido', expirationDate };
  }
  
  // Alerta de los 5 meses antes de vencer (solo para Bienvenida)
  if (!isBirthday) {
    const alertDate = addMonths(new Date(bono.created_at), 5);
    if (hasExpired(alertDate.toISOString())) {
      return { status: 'alerta_5_meses', expirationDate };
    }
  }
  
  return { status: 'pendiente', expirationDate };
}

/**
 * Procesa la lista de bonos de un cliente para extraer el activo y el historial.
 */
const processClientBonuses = (bonosRow?: BonoDbRow[]) => {
  if (!bonosRow || bonosRow.length === 0) {
    return { activeBonus: null, displayBonuses: [] as ClientBonusDisplay[] };
  }

  // Ordenar por fecha de creación (más reciente primero)
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

  // El bono "activo" para mostrar en la tabla es el primero que esté Pendiente.
  // Si no hay ninguno pendiente, tomamos el más reciente.
  const activeBonoRaw = sortedBonos.find((b) => b.estado === 'Pendiente') || sortedBonos[0];
  const { status, expirationDate } = calculateBonusStatus(activeBonoRaw);

  return {
    activeBonus: { ...activeBonoRaw, status, expirationDate },
    displayBonuses,
  };
};

/**
 * Mapea la fila de la base de datos al modelo de dominio 'Client'.
 */
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
  };
};

// --- Funciones de Servicio ---

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .select('*, bonos(*)')
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: ClientDbRow[] | null; error: PostgrestError | null }>
  );

  if (error) {
    logger.error('Error fetching clients', error, 'ClientService');
    throw new Error(error.message);
  }

  return (data || []).map(mapDbToClient);
};

export const getClientById = async (id: string): Promise<Client> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .select('*, bonos(*)')
      .eq('id', id)
      .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
  );

  if (error || !data) {
    logger.error(`Error fetching client ${id}`, error, 'ClientService');
    throw new Error(error?.message || 'Cliente no encontrado');
  }

  return mapDbToClient(data);
};

export const getClientFinancialHistory = async (clientId: string): Promise<Factura[]> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('facturas')
      .select('*, factura_items(*)')
      .eq('cliente_id', clientId)
      .order('fecha_venta', { ascending: false }) as unknown as Promise<{ data: Factura[] | null; error: PostgrestError | null }>
  );

  if (error) {
    logger.error(`Error fetching financial history for client ${clientId}`, error, 'ClientService');
    throw new Error(`No se pudo cargar el historial: ${error.message}`);
  }

  return data || [];
};

export const createClient = async (
  clientData: Omit<Client, 'id' | 'bono_estado' | 'bono_fecha_vencimiento'>
): Promise<Client> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .insert([{
        nombre: clientData.nombre,
        email: clientData.email,
        whatsapp: clientData.telefono,
        birthday: clientData.fecha_nacimiento,
      }])
      .select('*, bonos(*)')
      .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
  );

  if (error) throw new Error(error.message);
  return mapDbToClient(data);
};

/**
 * Redime el bono activo de un cliente si este solicita marcarlo como reclamado.
 */
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

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
  const dbUpdates: Partial<ClientDbRow> = {};
  if (updates.nombre) dbUpdates.nombre = updates.nombre;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.telefono) dbUpdates.whatsapp = updates.telefono;
  if (updates.fecha_nacimiento) dbUpdates.birthday = updates.fecha_nacimiento;

  // 1. Actualizar perfil básico si hay cambios
  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase
      .from('clientes_fidelizacion')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  // 2. Gestionar redención de bonos de forma aislada
  if (updates.bono_estado === 'reclamado') {
    await redeemActiveBonusForClient(id);
  }

  // 3. Recuperar y mapear el registro actualizado final
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .select('*, bonos(*)')
      .eq('id', id)
      .single() as unknown as Promise<{ data: ClientDbRow | null; error: PostgrestError | null }>
  );

  if (error) throw new Error(error.message);
  return mapDbToClient(data);
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes_fidelizacion')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
