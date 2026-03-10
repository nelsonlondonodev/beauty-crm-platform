import { useState, useEffect, useMemo } from 'react';
import { X, Save, Calendar, Clock, User, Scissors, Users, FileText, Trash2 } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { format } from 'date-fns';
import type { Appointment, Empleado } from '../../types';
import type { CreateAppointmentPayload } from '../../services/appointmentService';

// ── Types ───────────────────────────────────────────────────────────────────

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: CreateAppointmentPayload) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  staff: Empleado[];
  /** Pre-selected date/time from calendar click */
  defaultStart?: Date | null;
  /** Pre-selected staff from resource click */
  defaultStaffId?: string | null;
  /** Existing appointment to edit (null = create mode) */
  appointment?: Appointment | null;
}

type AppointmentStatus = 'programada' | 'completada' | 'cancelada';

interface FormState {
  client_id: string;
  empleado_id: string;
  fecha: string;
  hora: string;
  duracion: string;
  servicio: string;
  notas: string;
  estado: AppointmentStatus;
}

// ── Constants ───────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
];

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; className: string }[] = [
  { value: 'programada', label: 'Programada', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'completada', label: 'Completada', className: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'cancelada', label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const buildInitialFormState = (
  start?: Date | null,
  staffId?: string | null,
  existing?: Appointment | null
): FormState => {
  if (existing) {
    const date = new Date(existing.fecha_cita);
    return {
      client_id: existing.client_id,
      empleado_id: existing.empleado_id || '',
      fecha: format(date, 'yyyy-MM-dd'),
      hora: format(date, 'HH:mm'),
      duracion: String(existing.duracion_minutos || 60),
      servicio: existing.servicio,
      notas: existing.notas || '',
      estado: existing.estado,
    };
  }

  const now = start || new Date();
  return {
    client_id: '',
    empleado_id: staffId || '',
    fecha: format(now, 'yyyy-MM-dd'),
    hora: format(now, 'HH:mm'),
    duracion: '60',
    servicio: '',
    notas: '',
    estado: 'programada',
  };
};

// ── Component ───────────────────────────────────────────────────────────────

const AppointmentModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  staff,
  defaultStart,
  defaultStaffId,
  appointment,
}: AppointmentModalProps) => {
  const { clients, fetchClients } = useClients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>(() =>
    buildInitialFormState(defaultStart, defaultStaffId, appointment)
  );

  const isEditMode = Boolean(appointment);

  // Reset form when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialFormState(defaultStart, defaultStaffId, appointment));
      fetchClients();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultStart, defaultStaffId, appointment]);

  const activeStaff = useMemo(
    () => staff.filter((s) => s.activo),
    [staff]
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fecha_cita = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();

      if (isEditMode && appointment && onUpdate) {
        await onUpdate(appointment.id, {
          client_id: formData.client_id,
          empleado_id: formData.empleado_id || null,
          fecha_cita,
          duracion_minutos: Number(formData.duracion),
          servicio: formData.servicio,
          notas: formData.notas || undefined,
          estado: formData.estado,
        });
      } else {
        await onSave({
          client_id: formData.client_id,
          empleado_id: formData.empleado_id || null,
          fecha_cita,
          duracion_minutos: Number(formData.duracion),
          servicio: formData.servicio,
          notas: formData.notas || undefined,
          estado: 'programada',
          pago_estado: 'pendiente',
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(appointment.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
      <div className="animate-in zoom-in-95 relative w-full max-w-lg rounded-xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Cliente Selector */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <User className="h-3.5 w-3.5" />
                Cliente
              </label>
              <select
                name="client_id"
                required
                className="focus:border-primary focus:ring-primary block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                value={formData.client_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Colaborador Selector */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Users className="h-3.5 w-3.5" />
                Colaborador
              </label>
              <select
                name="empleado_id"
                className="focus:border-primary focus:ring-primary block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                value={formData.empleado_id}
                onChange={handleChange}
              >
                <option value="">Sin asignar</option>
                {activeStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nombre} — {member.rol}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha, Hora, Duración */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Calendar className="h-3.5 w-3.5" />
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  required
                  className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  value={formData.fecha}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock className="h-3.5 w-3.5" />
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  required
                  className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  value={formData.hora}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock className="h-3.5 w-3.5" />
                  Duración
                </label>
                <select
                  name="duracion"
                  className="focus:border-primary focus:ring-primary block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  value={formData.duracion}
                  onChange={handleChange}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servicio */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Scissors className="h-3.5 w-3.5" />
                Servicio
              </label>
              <input
                type="text"
                name="servicio"
                required
                placeholder="Ej. Corte de cabello, Manicure..."
                className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                value={formData.servicio}
                onChange={handleChange}
              />
            </div>

            {/* Notas */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <FileText className="h-3.5 w-3.5" />
                Notas
                <span className="text-xs text-gray-400">(opcional)</span>
              </label>
              <textarea
                name="notas"
                rows={2}
                placeholder="Observaciones adicionales..."
                className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none resize-none"
                value={formData.notas}
                onChange={handleChange}
              />
            </div>

            {/* Estado (solo en edición) */}
            {isEditMode && (
              <div>
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Estado
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, estado: opt.value }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        formData.estado === opt.value
                          ? `${opt.className} ring-1 ring-offset-1`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              {isEditMode && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Actualizar' : 'Agendar Cita'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
