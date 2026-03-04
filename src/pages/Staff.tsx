import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import {
  Users,
  DollarSign,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../contexts/AuthContext';
import { canPerform } from '../lib/rbac';
import { Navigate } from 'react-router-dom';
import NewStaffModal from '../components/staff/NewStaffModal';
import StaffTable from '../components/staff/StaffTable';

const Staff = () => {
  const { staff, loading, error, payEmployee, payAllPending, addStaff } =
    useStaff();
  const { role } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!canPerform(role, 'MANAGE_STAFF')) {
    return <Navigate to="/" replace />;
  }

  const totalSales = staff.reduce((acc, emp) => acc + emp.ventas_totales, 0);
  const totalCommissions = staff.reduce(
    (acc, emp) => acc + emp.saldo_pendiente,
    0
  );

  const handlePayAll = async () => {
    if (totalCommissions === 0)
      return alert('No hay comisiones pendientes por pagar.');
    if (
      !window.confirm(
        `¿Estás seguro de liquidar $${totalCommissions.toLocaleString()} a todos los empleados pendientes?`
      )
    )
      return;

    setIsProcessing(true);
    const result = await payAllPending();
    setIsProcessing(false);

    if (result.success) {
      alert('Pago masivo registrado con éxito.');
    } else {
      alert(`Error al registrar pagos: ${result.error}`);
    }
  };

  const handlePaySingle = async (
    empleadoId: string,
    monto: number,
    nombre: string
  ) => {
    if (monto === 0) return alert('No hay saldo pendiente para este empleado.');
    if (
      !window.confirm(
        `¿Registrar pago de $${monto.toLocaleString()} a ${nombre}?`
      )
    )
      return;

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Colaborador
          </button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Stats Overview */}
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

      <StaffTable
        staff={staff}
        loading={loading}
        isProcessing={isProcessing}
        handlePayAll={handlePayAll}
        handlePaySingle={handlePaySingle}
      />

      <NewStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          const res = await addStaff(data);
          if (!res.success) throw new Error(res.error);
        }}
      />
    </div>
  );
};

export default Staff;
