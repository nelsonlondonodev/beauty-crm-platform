import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

// ── Tipos ──────────────────────────────────────────────────────────────────

/** Datos de un bono validado, con el nombre del cliente asociado */
export interface ValidatedBono {
  id: string;
  codigo: string;
  tipo: string;
  estado: string;
  client_id: string;
  fecha_canje: string | null;
  clientes_fidelizacion?: { nombre: string } | null;
}

export interface RedemptionsFilter {
  periodo: 'hoy' | 'semana' | 'mes' | 'año' | 'todo';
  tipo?: string;
}

// ── Servicios ──────────────────────────────────────────────────────────────

/**
 * Busca un cupón por código y valida que esté en estado 'Pendiente'.
 * @throws Error si el código no existe o el bono no está pendiente.
 */
export const validateBonoCode = async (
  code: string
): Promise<ValidatedBono> => {
  const { data, error } = await supabase
    .from('bonos')
    .select(
      `
      id, codigo, tipo, estado,
      client_id,
      clientes_fidelizacion!client_id (nombre)
    `
    )
    .eq('codigo', code)
    .single();

  if (error || !data) {
    throw new Error('Cupón no encontrado o código incorrecto.');
  }

  if (data.estado !== 'Pendiente') {
    throw new Error(`El cupón se encuentra en estado: ${data.estado}.`);
  }

  // Supabase puede devolver la relación como array u objeto; normalizar
  return {
    ...data,
    clientes_fidelizacion: Array.isArray(data.clientes_fidelizacion)
      ? data.clientes_fidelizacion[0]
      : data.clientes_fidelizacion,
  } as ValidatedBono;
};

/**
 * Canjea un bono de forma atómica: asegura que el estado sea 'Pendiente'
 * antes de pasarlo a 'Canjeado', previniendo el Doble Canje (Double-Spend).
 * @throws Error si la actualización falla o ya fue canjeado por otra vía.
 */
export const redeemBono = async (bonoId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('bonos')
    .update({
      estado: 'Canjeado',
      fecha_canje: new Date().toISOString(),
    })
    .eq('id', bonoId)
    .eq('estado', 'Pendiente') // Condición Atómica
    .select('id')
    .maybeSingle();

  if (error) {
    logger.error('Error redeeming bono', error, 'BonoService');
    throw new Error(error.message);
  }

  if (!data) {
    logger.warn(`Intento de doble canje bloqueado en bono ${bonoId}`, 'BonoService');
    throw new Error('Lo sentimos, este bono ya fue canjeado previamente o no se encuentra Pendiente.');
  }
};

/**
 * Obtiene el historial de bonos canjeados con filtros de periodo y tipo.
 */
export const getRedeemedBonos = async (
  filters: RedemptionsFilter
): Promise<ValidatedBono[]> => {
  let query = supabase
    .from('bonos')
    .select(
      `
      id, codigo, tipo, estado, fecha_canje,
      client_id,
      clientes_fidelizacion!client_id (nombre)
    `
    )
    .eq('estado', 'Canjeado')
    .order('fecha_canje', { ascending: false });

  // Aplicar filtros de fecha según el periodo
  const now = new Date();
  let startDate: Date | null = null;

  if (filters.periodo === 'hoy') {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (filters.periodo === 'semana') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // lunes
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (filters.periodo === 'mes') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filters.periodo === 'año') {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  if (startDate && filters.periodo !== 'todo') {
    query = query.gte('fecha_canje', startDate.toISOString());
  }

  // Filtro por tipo de campaña
  if (filters.tipo && filters.tipo !== 'Todos') {
    query = query.eq('tipo', filters.tipo);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching redeemed bonos', error, 'BonoService');
    throw new Error('No se pudo cargar el historial de canjes.');
  }

  return (data || []).map((item) => ({
    ...item,
    clientes_fidelizacion: Array.isArray(item.clientes_fidelizacion)
      ? item.clientes_fidelizacion[0]
      : item.clientes_fidelizacion,
  })) as ValidatedBono[];
};
