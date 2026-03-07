import { supabase } from '../lib/supabase';
import type { InvoiceItem } from '../types';
import { logger } from '../lib/logger';

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
  const { data, error } = await supabase.rpc('procesar_factura_completa', {
    p_cliente_id: payload.cliente_id || null,
    p_subtotal: payload.subtotal,
    p_descuento: payload.descuento,
    p_total: payload.total,
    p_metodo_pago: payload.metodo_pago || 'Efectivo',
    p_items: itemsJson,
    p_bono_id: payload.bono_id || null,
  });

  if (error) {
    logger.error('Error procesando factura RPC', error.message, 'BillingService');
    throw new Error(`Error en el servidor: ${error.message}`);
  }

  // Si fue un éxito, data contiene success: true y el factura_id
  return data;
};
