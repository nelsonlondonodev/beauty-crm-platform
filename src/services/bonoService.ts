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
  clientes_fidelizacion?: { nombre: string } | null;
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
 * Canjea un bono: actualiza su estado a 'Canjeado' y registra la fecha.
 * @throws Error si la actualización falla.
 */
export const redeemBono = async (bonoId: string): Promise<void> => {
  const { error } = await supabase
    .from('bonos')
    .update({
      estado: 'Canjeado',
      fecha_canje: new Date().toISOString(),
    })
    .eq('id', bonoId);

  if (error) {
    logger.error('Error redeeming bono', error, 'BonoService');
    throw new Error(error.message);
  }
};
