import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Users, DollarSign, UserPlus, Scissors, TrendingUp } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  commissionRate: number;
  sales: number;
  tips: number;
}

// Mock data for the MVP
const initialStaff: StaffMember[] = [
  { id: '1', name: 'Ana Estilista', role: 'Estilista', commissionRate: 50, sales: 1200000, tips: 50000 },
  { id: '2', name: 'Carlos Barbero', role: 'Barbero', commissionRate: 60, sales: 850000, tips: 35000 },
  { id: '3', name: 'Laura Colorista', role: 'Colorista', commissionRate: 40, sales: 2100000, tips: 120000 },
];

const Staff = () => {
  const [staff] = useState<StaffMember[]>(initialStaff);

  const totalSales = staff.reduce((acc, emp) => acc + emp.sales, 0);
  const totalCommissions = staff.reduce((acc, emp) => acc + (emp.sales * (emp.commissionRate / 100)), 0);

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

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Equipo Activo</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
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
                Liquidación del Período
            </h3>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Liquidar Todos
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Colaborador</th>
                <th className="px-6 py-4 font-semibold text-center">Tasa (%)</th>
                <th className="px-6 py-4 font-semibold text-right">Ventas</th>
                <th className="px-6 py-4 font-semibold text-right">Comisión</th>
                <th className="px-6 py-4 font-semibold text-right">Propinas</th>
                <th className="px-6 py-4 font-semibold text-right">Total a Pagar</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((employee) => {
                const commission = employee.sales * (employee.commissionRate / 100);
                const totalPayment = commission + employee.tips;
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.role}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                        {employee.commissionRate}%
                    </td>
                    <td className="px-6 py-4 text-right">
                        ${employee.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        ${commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                        + ${employee.tips.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-primary font-bold text-base">
                        ${totalPayment.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
                            Pagar
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;
