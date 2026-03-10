import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import CalendarView from '../components/calendar/CalendarView';
import AppointmentModal from '../components/calendar/AppointmentModal';
import StaffFilter from '../components/calendar/StaffFilter';
import { useAppointments } from '../hooks/useAppointments';
import { useStaff } from '../hooks/useStaff';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment } from '../types';
import type { CreateAppointmentPayload } from '../services/appointmentService';

// ── Types ───────────────────────────────────────────────────────────────────

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'resourceTimeGridDay';

interface ModalState {
  isOpen: boolean;
  defaultStart: Date | null;
  defaultStaffId: string | null;
  editingAppointment: Appointment | null;
}

const INITIAL_MODAL_STATE: ModalState = {
  isOpen: false,
  defaultStart: null,
  defaultStaffId: null,
  editingAppointment: null,
};

// ── Component ───────────────────────────────────────────────────────────────

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('timeGridWeek');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [modalState, setModalState] = useState<ModalState>(INITIAL_MODAL_STATE);

  const {
    calendarEvents,
    appointments,
    fetchAppointments,
    addAppointment,
    editAppointment,
    removeAppointment,
  } = useAppointments();

  const { staff } = useStaff();

  // Initialize selected staff when staff data loads
  useEffect(() => {
    if (staff.length > 0 && selectedStaffIds.length === 0) {
      const activeIds = staff.filter((s) => s.activo).map((s) => s.id);
      setSelectedStaffIds(activeIds);
    }
  }, [staff, selectedStaffIds.length]);

  // Fetch appointments when date range or view changes
  const handleDateRangeChange = useCallback(
    (date: Date, view: ViewType) => {
      setCurrentDate(date);
      fetchAppointments(date, view);
    },
    [fetchAppointments]
  );

  // Initial fetch
  useEffect(() => {
    fetchAppointments(currentDate, currentView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modal Handlers ──────────────────────────────────────────────────────

  const openCreateModal = (start?: Date, _end?: Date, staffId?: string) => {
    setModalState({
      isOpen: true,
      defaultStart: start || new Date(),
      defaultStaffId: staffId || null,
      editingAppointment: null,
    });
  };

  const openEditModal = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    setModalState({
      isOpen: true,
      defaultStart: null,
      defaultStaffId: null,
      editingAppointment: apt,
    });
  };

  const closeModal = () => setModalState(INITIAL_MODAL_STATE);

  // ── CRUD Handlers ───────────────────────────────────────────────────────

  const handleSave = async (data: CreateAppointmentPayload) => {
    const result = await addAppointment(data);
    if (result.success) {
      toast.success('Cita agendada exitosamente');
    } else {
      toast.error(result.error || 'Error al agendar la cita');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Appointment>) => {
    const result = await editAppointment(id, updates);
    if (result.success) {
      toast.success('Cita actualizada');
    } else {
      toast.error(result.error || 'Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await removeAppointment(id);
    if (result.success) {
      toast.success('Cita eliminada');
    } else {
      toast.error(result.error || 'Error al eliminar');
    }
  };

  // ── View Toggle ─────────────────────────────────────────────────────────

  const toggleResourceView = () => {
    const newView: ViewType =
      currentView === 'resourceTimeGridDay' ? 'timeGridDay' : 'resourceTimeGridDay';
    setCurrentView(newView);
  };

  const isResourceView = currentView === 'resourceTimeGridDay';

  const activeStaff = useMemo(
    () => staff.filter((s) => s.activo),
    [staff]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header */}
      <DashboardHeader
        title="Agenda"
        subtitle="Gestiona las citas de tu equipo y sus horarios."
        actions={
          <div className="flex items-center gap-2">
            {/* Resource View Toggle */}
            {activeStaff.length > 0 && (
              <button
                onClick={toggleResourceView}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isResourceView
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="h-4 w-4" />
                Por colaborador
              </button>
            )}

            {/* New Appointment Button */}
            <button
              onClick={() => openCreateModal()}
              className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </button>
          </div>
        }
      />

      {/* Content */}
      <div className="flex flex-1 gap-4">
        {/* Staff Filter Sidebar */}
        {activeStaff.length > 0 && (
          <div className="hidden w-56 shrink-0 lg:block">
            <StaffFilter
              staff={staff}
              selectedIds={selectedStaffIds}
              onSelectionChange={setSelectedStaffIds}
            />
          </div>
        )}

        {/* Calendar */}
        <div className="min-w-0 flex-1">
          <CalendarView
            events={calendarEvents}
            staff={staff}
            selectedStaffIds={selectedStaffIds}
            currentView={currentView}
            onViewChange={setCurrentView}
            onDateRangeChange={handleDateRangeChange}
            onEventClick={openEditModal}
            onDateSelect={openCreateModal}
          />
        </div>
      </div>

      {/* Modal */}
      <AppointmentModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        staff={staff}
        defaultStart={modalState.defaultStart}
        defaultStaffId={modalState.defaultStaffId}
        appointment={modalState.editingAppointment}
      />
    </div>
  );
};

export default Calendar;
