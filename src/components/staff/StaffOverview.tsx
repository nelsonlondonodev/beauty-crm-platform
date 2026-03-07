import { Users, DollarSign, TrendingUp } from 'lucide-react';
import type { EmpleadoConSaldo } from '../../hooks/useStaff';

interface StaffOverviewProps {
  staff: EmpleadoConSaldo[];
}

const StaffOverview = ({ staff }: StaffOverviewProps) => {
  const totalSales = staff.reduce((acc, emp) => acc + emp.ventas_totales, 0);
  const totalCommissions = staff.reduce(
    (acc, emp) => acc + emp.saldo_pendiente,
    0
  );

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Equipo Activo</p>
          <p className="text-2xl font-bold text-gray-900">
            {staff.filter((s) => s.activo).length}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Ventas Registradas
          </p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalSales.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Comisiones por Pagar
          </p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalCommissions.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
