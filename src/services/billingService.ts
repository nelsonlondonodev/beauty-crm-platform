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

// --- Funciones Atómicas ---

/**
 * Obtiene un diccionario de IDs de empleados y sus porcentajes de comisión.
 */
async function getEmployeeCommissions(empleadoIds: string[]): Promise<Record<string, number>> {
  if (empleadoIds.length === 0) return {};

  const { data, error } = await supabase
    .from('empleados')
    .select('id, comision_porcentaje')
    .in('id', empleadoIds);

  if (error) {
    throw new Error(`Error al obtener comisiones: ${error.message}`);
  }

  return (data || []).reduce((acc, emp) => {
    acc[emp.id] = Number(emp.comision_porcentaje);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Inserta el registro principal de la factura.
 */
async function createInvoice(payload: Omit<FacturaPayload, 'items' | 'bono_id'>) {
  const { data, error } = await supabase
    .from('facturas')
    .insert([{
      cliente_id: payload.cliente_id,
      subtotal: payload.subtotal,
      descuento: payload.descuento,
      total: payload.total,
      metodo_pago: payload.metodo_pago || 'Efectivo',
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al guardar factura: ${error.message}`);
  }

  return data;
}

/**
 * Calcula y guarda los detalles de la factura con sus comisiones.
 */
async function createInvoiceItems(
  facturaId: string, 
  items: InvoiceItem[], 
  comisiones: Record<string, number>,
  subtotal: number,
  total: number,
  commissionPolicy: 'gross' | 'net' = 'gross'
) {
  const itemPriceToCommissionRatio = (total / subtotal) || 1;

  const itemsToInsert = items.map((item) => {
    const comisionPorcentaje = item.empleado_id ? comisiones[item.empleado_id] || 0 : 0;
    const precioBrutoTotal = item.price * item.quantity;
    
    // Cálculo basado en política: Bruto (precio total) o Neto (después de descuento proporcional)
    const precioBaseComision = commissionPolicy === 'net' 
      ? precioBrutoTotal * itemPriceToCommissionRatio 
      : precioBrutoTotal;

    const comisionMonto = precioBaseComision * (comisionPorcentaje / 100);

    return {
      factura_id: facturaId,
      empleado_id: item.empleado_id || null,
      descripcion: item.description,
      cantidad: item.quantity,
      precio_unitario: item.price,
      precio_total: precioBrutoTotal,
      comision_monto: comisionMonto,
    };
  });

  if (itemsToInsert.length > 0) {
    const { error } = await supabase.from('factura_items').insert(itemsToInsert);
    if (error) {
      throw new Error(`Error al guardar items de factura: ${error.message}`);
    }
  }
}

/**
 * Registra el canje de un bono si el ID está presente.
 */
async function redeemBonusIfExists(bonoId?: string) {
  if (!bonoId) return;

  const { error } = await supabase
    .from('bonos')
    .update({
      estado: 'Canjeado',
      fecha_canje: new Date().toISOString(),
    })
    .eq('id', bonoId);

  if (error) {
    logger.warn('Error al redimir bono con factura', error, 'BillingService');
  }
}

// --- Función Principal ---

export const procesarFactura = async (payload: FacturaPayload) => {
  // 1. Obtener IDs únicos de empleados omitiendo nulos
  const empleadoIds = Array.from(new Set(
    payload.items.map(item => item.empleado_id).filter(Boolean) as string[]
  ));

  // 2. Obtener datos necesarios e insertar factura base
  const comisiones = await getEmployeeCommissions(empleadoIds);
  const factura = await createInvoice(payload);

  // 3. Crear items de factura y procesar bonos de fidelización
  await createInvoiceItems(
    factura.id, 
    payload.items, 
    comisiones, 
    payload.subtotal, 
    payload.total, 
    payload.commissionPolicy
  );
  await redeemBonusIfExists(payload.bono_id);

  return factura;
};
