import { supabase } from '../lib/supabase';
import type { Empleado } from '../types';

// --- Interfaces de Dominio ---

export interface StaffBalance extends Empleado {
  ventas_totales: number;
  comision_total: number;
  saldo_pendiente: number;
}

// --- Funciones Atómicas de Datos ---

export const getEmpleados = async (): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Obtiene todos los items de facturas con información de comisiones.
 */
async function fetchCommissionData() {
  const { data, error } = await supabase
    .from('factura_items')
    .select('empleado_id, precio_total, comision_monto');
  
  if (error) throw new Error(`Error al obtener comisiones: ${error.message}`);
  return (data || []) as { empleado_id: string | null; precio_total: number; comision_monto: number }[];
}

/**
 * Obtiene el historial completo de pagos de comisiones realizados.
 */
async function fetchPaymentData() {
  const { data, error } = await supabase
    .from('pagos_comisiones')
    .select('empleado_id, monto_pagado');

  if (error) throw new Error(`Error al obtener pagos: ${error.message}`);
  return (data || []) as { empleado_id: string | null; monto_pagado: number }[];
}

// --- Utilidades de Cálculo (Puras) ---

/**
 * Calcula los totales (ventas, comisiones y saldo) para un empleado específico.
 */
function calculateStaffBalance(
  emp: Empleado, 
  comisiones: { empleado_id: string | null; precio_total: number; comision_monto: number }[], 
  pagos: { empleado_id: string | null; monto_pagado: number }[]
): StaffBalance {
  const empItems = comisiones.filter((c) => c.empleado_id === emp.id);
  const totalVentas = empItems.reduce((sum, item) => sum + (Number(item.precio_total) || 0), 0);
  const totalGanado = empItems.reduce((sum, item) => sum + (Number(item.comision_monto) || 0), 0);

  const empPagos = pagos.filter((p) => p.empleado_id === emp.id);
  const totalPagado = empPagos.reduce((sum, pago) => sum + (Number(pago.monto_pagado) || 0), 0);

  return {
    ...emp,
    ventas_totales: totalVentas,
    comision_total: totalGanado,
    saldo_pendiente: Math.max(0, totalGanado - totalPagado),
  };
}

// --- Funciones de Servicio UI ---

/**
 * Orquesta la carga de empleados con sus respectivos estados financieros calculados.
 */
export const getEmpleadosConSaldos = async (): Promise<StaffBalance[]> => {
  // Ejecución paralela para evitar bloqueos secuenciales
  const [empleados, comisiones, pagos] = await Promise.all([
    getEmpleados(),
    fetchCommissionData(),
    fetchPaymentData()
  ]);

  if (empleados.length === 0) return [];

  return empleados.map((emp) => calculateStaffBalance(emp, comisiones, pagos));
};

export const crearEmpleado = async (
  empleado: Omit<Empleado, 'id' | 'created_at' | 'activo'> & { activo?: boolean }
) => {
  const { data, error } = await supabase
    .from('empleados')
    .insert([{
      nombre: empleado.nombre,
      rol: empleado.rol,
      comision_porcentaje: empleado.comision_porcentaje,
      activo: empleado.activo ?? true,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const registrarPagoComision = async (
  empleadoId: string,
  monto: number,
  notas?: string
) => {
  const { data, error } = await supabase
    .from('pagos_comisiones')
    .insert([{
      empleado_id: empleadoId,
      monto_pagado: monto,
      notas: notas || 'Pago manual',
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const liquidarTodos = async (
  pagos: { empleado_id: string; monto: number }[]
) => {
  const inserts = pagos.map((p) => ({
    empleado_id: p.empleado_id,
    monto_pagado: p.monto,
    notas: 'Liquidación masiva',
  }));

  const { data, error } = await supabase
    .from('pagos_comisiones')
    .insert(inserts)
    .select();

  if (error) throw new Error(error.message);
  return data;
};
