import { supabase } from '../lib/supabase';
import type { InvoiceItem } from '../types';
import { logger } from '../lib/logger';

interface FacturaPayload {
  cliente_id?: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago?: string;
  items: InvoiceItem[];
  bono_id?: string; // ID del bono que será canjeado con la compra
}

export const procesarFactura = async (payload: FacturaPayload) => {
  // 1. Opcional: Obtener porcentajes de comisión de los empleados involucrados
  const empleadoIds = payload.items
    .map((item) => item.empleado_id)
    .filter(Boolean) as string[];

  let empleadosDict: Record<string, number> = {};
  if (empleadoIds.length > 0) {
    const { data: empleadosData, error: empError } = await supabase
      .from('empleados')
      .select('id, comision_porcentaje')
      .in('id', empleadoIds);

    if (empError)
      throw new Error(`Error al obtener comisiones: ${empError.message}`);
    empleadosDict = (empleadosData || []).reduce(
      (acc, emp) => {
        acc[emp.id] = Number(emp.comision_porcentaje);
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // 2. Insertar Factura Principal
  const { data: facturaData, error: facturaError } = await supabase
    .from('facturas')
    .insert([
      {
        cliente_id: payload.cliente_id,
        subtotal: payload.subtotal,
        descuento: payload.descuento,
        total: payload.total,
        metodo_pago: payload.metodo_pago || 'Efectivo',
      },
    ])
    .select()
    .single();

  if (facturaError)
    throw new Error(`Error al guardar factura: ${facturaError.message}`);

  const facturaId = facturaData.id;

  // 3. Preparar los items con su cálculo de comisión
  const itemsToInsert = payload.items.map((item) => {
    const comisionPorcentaje = item.empleado_id
      ? empleadosDict[item.empleado_id] || 0
      : 0;
    const precioTotal = item.price * item.quantity;
    const comisionMonto = precioTotal * (comisionPorcentaje / 100);

    return {
      factura_id: facturaId,
      empleado_id: item.empleado_id || null,
      descripcion: item.description,
      cantidad: item.quantity,
      precio_unitario: item.price,
      precio_total: precioTotal,
      comision_monto: comisionMonto,
    };
  });

  // 4. Insertar los Items
  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from('factura_items')
      .insert(itemsToInsert);

    if (itemsError)
      throw new Error(
        `Error al guardar items de factura: ${itemsError.message}`
      );
  }

  // 5. Actualizar el estado del bono a "Canjeado" si se aplicó uno
  if (payload.bono_id) {
    const { error: bonoError } = await supabase
      .from('bonos')
      .update({
        estado: 'Canjeado',
        fecha_canje: new Date().toISOString(),
      })
      .eq('id', payload.bono_id);

    if (bonoError) {
      logger.warn('Error al redimir bono con factura', bonoError, 'BillingService');
      // No lanzamos excepcion para no abortar la factura que ya se guardo con exito
    }
  }

  // 6. Devolver la factura guardada
  return facturaData;
};
