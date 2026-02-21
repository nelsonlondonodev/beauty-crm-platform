import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Client } from '../../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'bono_estado'>) => Promise<void>;
  initialData?: Client | null;
}

const NewClientModal = ({ isOpen, onClose, onSave, initialData }: NewClientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'bono_estado'>>({
    nombre: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    bono_fecha_vencimiento: '',
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setFormData({
        nombre: initialData.nombre,
        email: initialData.email,
        telefono: initialData.telefono,
        fecha_nacimiento: initialData.fecha_nacimiento,
        bono_fecha_vencimiento: initialData.bono_fecha_vencimiento,
      });
    } else {
      setFormData({ nombre: '', email: '', telefono: '', fecha_nacimiento: '', bono_fecha_vencimiento: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input 
              type="text" name="nombre" required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              value={formData.nombre} onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" name="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                value={formData.email} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input 
                type="tel" name="telefono"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                value={formData.telefono} onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
              <input 
                type="date" name="fecha_nacimiento"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                value={formData.fecha_nacimiento} onChange={handleChange}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Vencimiento Bono</label>
               <input 
                type="date" name="bono_fecha_vencimiento"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                value={formData.bono_fecha_vencimiento} onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button 
              type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> {initialData ? 'Actualizar Cliente' : 'Guardar Cliente'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;
