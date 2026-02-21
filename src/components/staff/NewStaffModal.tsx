import React, { useState } from 'react';
import { X, UserPlus, Briefcase, Percent } from 'lucide-react';

interface NewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: { nombre: string; rol: string; comision_porcentaje: number }) => Promise<void>;
}

const NewStaffModal: React.FC<NewStaffModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    comision_porcentaje: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.nombre || !formData.rol) {
        throw new Error('Por favor completa todos los campos requeridos.');
      }
      if (formData.comision_porcentaje < 0 || formData.comision_porcentaje > 100) {
        throw new Error('El porcentaje de comisión debe estar entre 0 y 100.');
      }

      await onSave(formData);
      
      // Reset form
      setFormData({
        nombre: '',
        rol: '',
        comision_porcentaje: 30,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-primary" />
            Nuevo Colaborador
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nombre"
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  placeholder="Ej. Ana García"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                Rol / Especialidad *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="rol"
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <option value="" disabled>Seleccionar Rol</option>
                  <option value="Estilista">Estilista</option>
                  <option value="Manicurista">Manicurista</option>
                  <option value="Barbero/a">Barbero/a</option>
                  <option value="Maquillador/a">Maquillador/a</option>
                  <option value="Cosmetólogo/a">Cosmetólogo/a</option>
                  <option value="Admin/Recepción">Admin / Recepción</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="comision_porcentaje" className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de Comisión (%) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Percent className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="comision_porcentaje"
                  required
                  min="0"
                  max="100"
                  className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  placeholder="30"
                  value={formData.comision_porcentaje}
                  onChange={(e) => setFormData({ ...formData, comision_porcentaje: Number(e.target.value) })}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Este porcentaje se usará para calcular la ganancia del empleado por cada servicio facturado.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStaffModal;
