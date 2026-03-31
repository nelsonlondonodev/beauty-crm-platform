import { supabase } from '../lib/supabase';
import type { 
  InvoiceItem, 
  Factura, 
  FacturaItem, 
  FacturaWithClient, 
  FacturaItemWithRelations,
  Result,
} from '../types';
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

export const procesarFactura = async (payload: FacturaPayload): Promise<Result<{ success: boolean, factura_id: string }>> => {
  try {
    const itemsJson = payload.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      empleado_id: item.empleado_id || null,
    }));

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
      10000
    );

    if (error || !data) throw error || new Error('No se pudo procesar la factura');
    return { success: true, data };
  } catch (err: any) {
    logger.error('Error procesando factura RPC', err.message, 'BillingService');
    return { success: false, error: `Error en el servidor: ${err.message}` };
  }
};

export const getFacturas = async (): Promise<Result<FacturaWithClient[]>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('facturas')
        .select('*, clientes_fidelizacion(nombre)')
        .order('fecha_venta', { ascending: false }) as unknown as Promise<{ data: FacturaWithClient[] | null; error: PostgrestError | null }>
    );

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    logger.error('Error fetching facturas', err.message, 'BillingService');
    return { success: false, error: err.message };
  }
};

export const getFacturaById = async (id: string): Promise<Result<Factura & { factura_items: FacturaItem[] }>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('facturas')
        .select('*, factura_items(*), clientes_fidelizacion(nombre, whatsapp, email)')
        .eq('id', id)
        .single() as unknown as Promise<{ data: Factura & { factura_items: FacturaItem[] } | null; error: PostgrestError | null }>
    );

    if (error || !data) throw error || new Error('Factura no encontrada');
    return { success: true, data };
  } catch (err: any) {
    logger.error(`Error fetching factura ${id}`, err.message, 'BillingService');
    return { success: false, error: err.message };
  }
};

export const getFacturasByEmpleado = async (empleadoId: string): Promise<Result<FacturaItemWithRelations[]>> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('factura_items')
        .select('*, facturas(*, clientes_fidelizacion(nombre))')
        .eq('empleado_id', empleadoId)
        .order('created_at', { ascending: false }) as unknown as Promise<{ data: FacturaItemWithRelations[] | null; error: PostgrestError | null }>
    );

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    logger.error(`Error fetching facturas for empleado ${empleadoId}`, err.message, 'BillingService');
    return { success: false, error: err.message };
  }
};
