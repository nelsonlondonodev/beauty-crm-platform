import { Scissors, Edit2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmpleadoConSaldo } from '../../hooks/useStaff';
import { DataTable } from '../ui/DataTable';
import type { ColumnDef } from '../../types/table';

interface StaffTableProps {
  staff: EmpleadoConSaldo[];
  loading: boolean;
  isProcessing: boolean;
  handlePayAll: () => void;
  handlePaySingle: (empleadoId: string, monto: number, nombre: string) => void;
  onEdit: (employee: EmpleadoConSaldo) => void;
}

const StaffTable = ({
  staff,
  loading,
  isProcessing,
  handlePayAll,
  handlePaySingle,
  onEdit,
}: StaffTableProps) => {
  const navigate = useNavigate();
  const totalCommissions = staff.reduce(
    (acc, emp) => acc + emp.saldo_pendiente,
    0
  );

  const columns: ColumnDef<EmpleadoConSaldo>[] = [
    {
      header: 'Colaborador',
      cell: (employee) => (
        <>
          <div className="font-semibold text-gray-900">
            {employee.nombre} {employee.activo === false && '(Inactivo)'}
          </div>
          <div className="text-xs text-gray-500">{employee.rol}</div>
        </>
      ),
    },
    {
      header: 'Tasa (%)',
      className: 'text-center font-medium',
      cell: (employee) => `${employee.comision_porcentaje}%`,
    },
    {
      header: 'Ventas Acum.',
      className: 'text-right',
      cell: (employee) => `$${employee.ventas_totales.toLocaleString()}`,
    },
    {
      header: 'Comisión Hist.',
      className: 'text-right font-medium text-gray-600',
      cell: (employee) => `$${employee.comision_total.toLocaleString()}`,
    },
    {
      header: 'Saldo Pendiente',
      className: 'text-right text-base font-bold text-primary',
      cell: (employee) => `$${employee.saldo_pendiente.toLocaleString()}`,
    },
    {
      header: 'Acción',
      className: 'w-40',
      cell: (employee) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(employee)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Editar empleado"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/staff/${employee.id}/sales`)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            title="Ver historial de ventas"
          >
            <History className="h-4 w-4" />
          </button>
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
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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

      <DataTable<EmpleadoConSaldo>
        data={staff}
        columns={columns}
        keyExtractor={(employee) => employee.id}
        loading={loading}
        emptyMessage="No hay empleados registrados. Añade uno para comenzar."
        className="rounded-none border-0 shadow-none"
      />
    </div>
  );
};

export default StaffTable;
