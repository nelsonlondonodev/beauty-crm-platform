import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { UserPlus } from 'lucide-react';
import { useStaff, type EmpleadoConSaldo } from '../hooks/useStaff';
import { useAuth } from '../contexts/AuthContext';
import { canPerform } from '../lib/rbac';
import { Navigate } from 'react-router-dom';
import StaffModal from '../components/staff/StaffModal';
import StaffTable from '../components/staff/StaffTable';
import StaffOverview from '../components/staff/StaffOverview';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';

const Staff = () => {
  const { staff, loading, error, payEmployee, payAllPending, addStaff, updateStaff } = useStaff();
  const { role } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<EmpleadoConSaldo | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  if (!canPerform(role, 'MANAGE_STAFF')) {
    return <Navigate to="/" replace />;
  }

  const handlePayAll = () => {
    const totalCommissions = staff.reduce((acc, emp) => acc + emp.saldo_pendiente, 0);
    if (totalCommissions === 0) return toast.info('No hay comisiones pendientes por pagar.');

    setConfirmState({
      isOpen: true,
      title: 'Liquidar todas las comisiones',
      message: `¿Estás seguro de liquidar $${totalCommissions.toLocaleString()} a todos los empleados pendientes?`,
      action: async () => {
        setIsProcessing(true);
        const result = await payAllPending();
        setIsProcessing(false);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));

        if (result.success) {
          toast.success('Pago masivo registrado con éxito.');
        } else {
          toast.error(`Error al registrar pagos: ${result.error}`);
        }
      },
    });
  };

  const handlePaySingle = (empleadoId: string, monto: number, nombre: string) => {
    if (monto === 0) return toast.info('No hay saldo pendiente para este empleado.');

    setConfirmState({
      isOpen: true,
      title: `Liquidar comisión a ${nombre}`,
      message: `¿Registrar pago de $${monto.toLocaleString()} a ${nombre}?`,
      action: async () => {
        setIsProcessing(true);
        const result = await payEmployee(empleadoId, monto);
        setIsProcessing(false);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));

        if (result.success) {
          toast.success('Pago registrado con éxito.');
        } else {
          toast.error(`Error al registrar pago: ${result.error}`);
        }
      },
    });
  };

  const handleSaveStaff = async (data: any) => {
    if (editingStaff) {
      const res = await updateStaff(editingStaff.id, data);
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await addStaff(data);
      if (!res.success) throw new Error(res.error);
    }
  };

  const openNewStaffModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const openEditStaffModal = (employee: EmpleadoConSaldo) => {
    setEditingStaff(employee);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Gestión de Personal y Comisiones"
        subtitle="Administra tu equipo, porcentajes de ganancia y liquidación de servicios."
        actions={
          <button
            onClick={openNewStaffModal}
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
      <StaffOverview staff={staff} />

      <StaffTable
        staff={staff}
        loading={loading}
        isProcessing={isProcessing}
        handlePayAll={handlePayAll}
        handlePaySingle={handlePaySingle}
        onEdit={openEditStaffModal}
      />

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingStaff}
        onSave={handleSaveStaff}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Sí, liquidar"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Staff;
