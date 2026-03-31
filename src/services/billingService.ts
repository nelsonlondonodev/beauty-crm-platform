import { supabase } from '../lib/supabase';
import type { InvoiceItem, Factura, FacturaItem, FacturaWithClient, FacturaItemWithRelations } from '../types';
import { logger } from '../lib/logger';
import { fetchWithTimeout } from '../lib/utils';
import type { PostgrestError } from '@supabase/supabase-js';

// --- Interfaces ---

interface FacturaPayload {
  cliente_id?: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago?: string;
  items: InvoiceItem[];
  bono_id?: string;
  commissionPolicy?: 'gross' | 'net';
}

// --- Función Principal ---

export const procesarFactura = async (payload: FacturaPayload) => {
  // Construir el JSON de items para la base de datos
  const itemsJson = payload.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    empleado_id: item.empleado_id || null, // null es crucial para la DB
  }));

  // Llamada a la función transaccional (RPC) en Supabase
  const { data, error } = await fetchWithTimeout(
    supabase.rpc('procesar_factura_completa', {
      p_cliente_id: payload.cliente_id || null,
      p_subtotal: payload.subtotal,
      p_descuento: payload.descuento,
      p_total: payload.total,
      p_metodo_pago: payload.metodo_pago || 'Efectivo',
      p_items: itemsJson,
      p_bono_id: payload.bono_id || null,
    }) as unknown as Promise<{ data: { success: boolean, factura_id: string } | null; error: PostgrestError | null }>,
    10000 // Timeout extendido para transacciones
  );

  if (error) {
    logger.error('Error procesando factura RPC', error.message, 'BillingService');
    throw new Error(`Error en el servidor: ${error.message}`);
  }

  // Si fue un éxito, data contiene success: true y el factura_id
  return data;
};

export const getFacturas = async (): Promise<FacturaWithClient[]> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('facturas')
      .select('*, clientes_fidelizacion(nombre)')
      .order('fecha_venta', { ascending: false }) as unknown as Promise<{ data: FacturaWithClient[] | null; error: PostgrestError | null }>
  );

  if (error) {
    logger.error('Error fetching facturas', error.message, 'BillingService');
    throw new Error(error.message);
  }
  return data || [];
};

export const getFacturaById = async (id: string): Promise<Factura & { factura_items: FacturaItem[] }> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('facturas')
      .select('*, factura_items(*), clientes_fidelizacion(nombre, whatsapp, email)')
      .eq('id', id)
      .single() as unknown as Promise<{ data: Factura & { factura_items: FacturaItem[] } | null; error: PostgrestError | null }>
  );

  if (error) {
    logger.error(`Error fetching factura ${id}`, error.message, 'BillingService');
    throw new Error(error.message);
  }
  if (!data) throw new Error('Cita no encontrada');
  return data;
};

export const getFacturasByEmpleado = async (empleadoId: string): Promise<FacturaItemWithRelations[]> => {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('factura_items')
      .select('*, facturas(*, clientes_fidelizacion(nombre))')
      .eq('empleado_id', empleadoId)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: FacturaItemWithRelations[] | null; error: PostgrestError | null }>
  );

  if (error) {
    logger.error(`Error fetching facturas for empleado ${empleadoId}`, error.message, 'BillingService');
    throw new Error(error.message);
  }
  return data || [];
};
