import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Users, DollarSign, UserPlus, Scissors, TrendingUp, Loader2 } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';

const Staff = () => {
  const { staff, loading, error, payEmployee, payAllPending } = useStaff();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalSales = staff.reduce((acc, emp) => acc + emp.ventas_totales, 0);
  const totalCommissions = staff.reduce((acc, emp) => acc + emp.saldo_pendiente, 0);

  const handlePayAll = async () => {
    if (totalCommissions === 0) return alert('No hay comisiones pendientes por pagar.');
    if (!window.confirm(`¿Estás seguro de liquidar $${totalCommissions.toLocaleString()} a todos los empleados pendientes?`)) return;

    setIsProcessing(true);
    const result = await payAllPending();
    setIsProcessing(false);

    if (result.success) {
      alert('Pago masivo registrado con éxito.');
    } else {
      alert(`Error al registrar pagos: ${result.error}`);
    }
  };

  const handlePaySingle = async (empleadoId: string, monto: number, nombre: string) => {
    if (monto === 0) return alert('No hay saldo pendiente para este empleado.');
    if (!window.confirm(`¿Registrar pago de $${monto.toLocaleString()} a ${nombre}?`)) return;

    setIsProcessing(true);
    const result = await payEmployee(empleadoId, monto);
    setIsProcessing(false);

    if (result.success) {
      alert('Pago registrado con éxito.');
    } else {
      alert(`Error al registrar pago: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Gestión de Personal y Comisiones" 
        subtitle="Administra tu equipo, porcentajes de ganancia y liquidación de servicios."
        actions={
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Colaborador
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Equipo Activo</p>
                <p className="text-2xl font-bold text-gray-900">{staff.filter(s => s.activo).length}</p>
            </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Ventas Registradas</p>
                <p className="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</p>
            </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <DollarSign className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Comisiones por Pagar</p>
                <p className="text-2xl font-bold text-gray-900">${totalCommissions.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Staff & Commissions Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Scissors className="h-5 w-5 mr-2 text-gray-500" />
                Saldos y Liquidación
            </h3>
            <button 
                onClick={handlePayAll}
                disabled={loading || isProcessing || totalCommissions === 0}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
                {isProcessing ? 'Procesando...' : 'Liquidar Todos'}
            </button>
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : staff.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                No hay empleados registrados. Añade uno para comenzar.
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white text-xs uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Colaborador</th>
                    <th className="px-6 py-4 font-semibold text-center">Tasa (%)</th>
                    <th className="px-6 py-4 font-semibold text-right">Ventas Acum.</th>
                    <th className="px-6 py-4 font-semibold text-right">Comisión Hist.</th>
                    <th className="px-6 py-4 font-semibold text-right text-primary">Saldo Pendiente</th>
                    <th className="px-6 py-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{employee.nombre} {employee.activo === false && '(Inactivo)'}</div>
                          <div className="text-xs text-gray-500">{employee.rol}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                            {employee.comision_porcentaje}%
                        </td>
                        <td className="px-6 py-4 text-right">
                            ${employee.ventas_totales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 font-medium">
                            ${employee.comision_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-primary font-bold text-base">
                            ${employee.saldo_pendiente.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => handlePaySingle(employee.id, employee.saldo_pendiente, employee.nombre)}
                                disabled={employee.saldo_pendiente <= 0 || isProcessing}
                                className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Pagar
                            </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
