import { supabase } from '../lib/supabase';
import type { Empleado } from '../types';

export const getEmpleados = async (): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data || [];
};

export const crearEmpleado = async (empleado: Omit<Empleado, 'id' | 'created_at' | 'activo'> & { activo?: boolean }) => {
  const { data, error } = await supabase
    .from('empleados')
    .insert([{
      nombre: empleado.nombre,
      rol: empleado.rol,
      comision_porcentaje: empleado.comision_porcentaje,
      activo: empleado.activo ?? true
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getPendientesEmpleados = async () => {
  // To get the pending commission, we need to sum all comision_monto from factura_items
  // and subtract all monto_pagado from pagos_comisiones for each employee.
  
  // 1. Get all employees
  const empleados = await getEmpleados();
  if (empleados.length === 0) return [];

  // 2. Get all commission items
  const { data: comisiones, error: comisionesError } = await supabase
    .from('factura_items')
    .select('empleado_id, comision_monto');
  if (comisionesError) throw new Error(comisionesError.message);

  // 3. Get all payments
  const { data: pagos, error: pagosError } = await supabase
    .from('pagos_comisiones')
    .select('empleado_id, monto_pagado');
  if (pagosError) throw new Error(pagosError.message);

  // 4. Calculate aggregates
  const result = empleados.map(emp => {
      const empComisiones = comisiones?.filter(c => c.empleado_id === emp.id) || [];
      const totalGanado = empComisiones.reduce((sum, item) => sum + (Number(item.comision_monto) || 0), 0);
      
      const empPagos = pagos?.filter(p => p.empleado_id === emp.id) || [];
      const totalPagado = empPagos.reduce((sum, pago) => sum + (Number(pago.monto_pagado) || 0), 0);

      // We'll approximate 'sales' by reverse-calculating from the commission percentage 
      // since the query only gets the comision_monto for simplicity, 
      // or we can fetch precio_total as well. Let's fetch it for better accuracy.
      return {
          ...emp,
          total_ventas: 0, // We will update this logic
          total_ganado: totalGanado,
          total_pagado: totalPagado,
          saldo_pendiente: Math.max(0, totalGanado - totalPagado)
      };
  });

  return result;
};

// Refined version that accurately gets sales too
export const getEmpleadosConSaldos = async () => {
    const empleados = await getEmpleados();
    if (empleados.length === 0) return [];
  
    const { data: comisiones, error: comisionesError } = await supabase
      .from('factura_items')
      .select('empleado_id, precio_total, comision_monto');
      
    if (comisionesError) throw new Error(comisionesError.message);
  
    const { data: pagos, error: pagosError } = await supabase
      .from('pagos_comisiones')
      .select('empleado_id, monto_pagado');
      
    if (pagosError) throw new Error(pagosError.message);
  
    return empleados.map(emp => {
        const empItems = comisiones?.filter(c => c.empleado_id === emp.id) || [];
        const totalVentas = empItems.reduce((sum, item) => sum + (Number(item.precio_total) || 0), 0);
        const totalGanado = empItems.reduce((sum, item) => sum + (Number(item.comision_monto) || 0), 0);
        
        const empPagos = pagos?.filter(p => p.empleado_id === emp.id) || [];
        const totalPagado = empPagos.reduce((sum, pago) => sum + (Number(pago.monto_pagado) || 0), 0);
  
        return {
            ...emp,
            ventas_totales: totalVentas,
            comision_total: totalGanado,
            saldo_pendiente: Math.max(0, totalGanado - totalPagado)
        };
    });
};

export const registrarPagoComision = async (empleadoId: string, monto: number, notas?: string) => {
    const { data, error } = await supabase
      .from('pagos_comisiones')
      .insert([
          { empleado_id: empleadoId, monto_pagado: monto, notas: notas || 'Pago manual' }
      ])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
};

export const liquidarTodos = async (pagos: {empleado_id: string, monto: number}[]) => {
    const inserts = pagos.map(p => ({
        empleado_id: p.empleado_id,
        monto_pagado: p.monto,
        notas: 'Liquidación masiva'
    }));

    const { data, error } = await supabase
      .from('pagos_comisiones')
      .insert(inserts)
      .select();
      
    if (error) throw new Error(error.message);
    return data;
};
