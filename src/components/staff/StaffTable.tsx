import { Scissors, Loader2 } from 'lucide-react';
import type { EmpleadoConSaldo } from '../../hooks/useStaff';

interface StaffTableProps {
  staff: EmpleadoConSaldo[];
  loading: boolean;
  isProcessing: boolean;
  handlePayAll: () => void;
  handlePaySingle: (empleadoId: string, monto: number, nombre: string) => void;
}

const StaffTable = ({
  staff,
  loading,
  isProcessing,
  handlePayAll,
  handlePaySingle,
}: StaffTableProps) => {
  const totalCommissions = staff.reduce(
    (acc, emp) => acc + emp.saldo_pendiente,
    0
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900">
          <Scissors className="mr-2 h-5 w-5 text-gray-500" />
          Saldos y Liquidación
        </h3>
        <button
          onClick={handlePayAll}
          disabled={loading || isProcessing || totalCommissions === 0}
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Procesando...' : 'Liquidar Todos'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : staff.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No hay empleados registrados. Añade uno para comenzar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-white text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Colaborador</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Tasa (%)
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Ventas Acum.
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Comisión Hist.
                </th>
                <th className="text-primary px-6 py-4 text-right font-semibold">
                  Saldo Pendiente
                </th>
                <th className="px-6 py-4 text-center font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((employee) => (
                <tr
                  key={employee.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {employee.nombre}{' '}
                      {employee.activo === false && '(Inactivo)'}
                    </div>
                    <div className="text-xs text-gray-500">{employee.rol}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {employee.comision_porcentaje}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${employee.ventas_totales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-600">
                    ${employee.comision_total.toLocaleString()}
                  </td>
                  <td className="text-primary px-6 py-4 text-right text-base font-bold">
                    ${employee.saldo_pendiente.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        handlePaySingle(
                          employee.id,
                          employee.saldo_pendiente,
                          employee.nombre
                        )
                      }
                      disabled={employee.saldo_pendiente <= 0 || isProcessing}
                      className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
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
  );
};

export default StaffTable;
