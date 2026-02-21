import { useState, useEffect } from 'react';
import { getEmpleadosConSaldos, registrarPagoComision, liquidarTodos, crearEmpleado } from '../services/staffService';
import type { Empleado } from '../types';

export interface EmpleadoConSaldo extends Empleado {
  ventas_totales: number;
  comision_total: number;
  saldo_pendiente: number;
}

export const useStaff = () => {
  const [staff, setStaff] = useState<EmpleadoConSaldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const data = await getEmpleadosConSaldos();
      setStaff(data as EmpleadoConSaldo[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const payEmployee = async (empleadoId: string, monto: number) => {
    try {
      await registrarPagoComision(empleadoId, monto);
      await fetchStaffData(); // Refresh data to reset balance
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const payAllPending = async () => {
    const pendingPayments = staff
      .filter(emp => emp.saldo_pendiente > 0)
      .map(emp => ({
        empleado_id: emp.id,
        monto: emp.saldo_pendiente
      }));

    if (pendingPayments.length === 0) return { success: true, message: 'No hay pagos pendientes' };

    try {
      await liquidarTodos(pendingPayments);
      await fetchStaffData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addStaff = async (staffData: { nombre: string; rol: string; comision_porcentaje: number }) => {
    try {
      await crearEmpleado(staffData);
      await fetchStaffData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { staff, loading, error, fetchStaffData, payEmployee, payAllPending, addStaff };
};
