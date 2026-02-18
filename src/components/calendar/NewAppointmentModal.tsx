import { useState, useEffect } from 'react';
import { X, Save, Clock, User } from 'lucide-react';
import { useClients } from '../../hooks/useClients';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => Promise<void>;
  selectedDate: Date | null;
}

const NewAppointmentModal = ({ isOpen, onClose, onSave, selectedDate }: NewAppointmentModalProps) => {
  const { clients, fetchClients } = useClients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    fecha: '',
    hora: '09:00',
    servicio: '',
    nota: ''
  });

  useEffect(() => {
    if (isOpen) {
        fetchClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        fecha: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fecha_cita = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();

    await onSave({
      cliente_id: formData.cliente_id,
      fecha_cita: fecha_cita,
      servicio: formData.servicio,
      estado: 'programada',
      pago_estado: 'pendiente'
    });

    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Nueva Cita</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cliente Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <div className="relative mt-1">
                <select
                    name="cliente_id"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    value={formData.cliente_id}
                    onChange={handleChange}
                >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.nombre}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                   <User className="h-4 w-4" />
                </div>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <div className="relative mt-1">
                <input 
                    type="date" 
                    name="fecha" 
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    value={formData.fecha} 
                    onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora</label>
              <div className="relative mt-1">
                <input 
                    type="time" 
                    name="hora" 
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    value={formData.hora} 
                    onChange={handleChange}
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Servicio</label>
            <input 
              type="text" name="servicio" required
              placeholder="Ej. Corte de cabello, Manicure..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              value={formData.servicio} onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button 
              type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> Agendar Cita</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
