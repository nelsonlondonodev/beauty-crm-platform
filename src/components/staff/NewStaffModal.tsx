import React, { useState } from 'react';
import { X, UserPlus, Briefcase, Percent } from 'lucide-react';

interface NewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: {
    nombre: string;
    rol: string;
    comision_porcentaje: number;
  }) => Promise<void>;
}

const NewStaffModal: React.FC<NewStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
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
      if (
        formData.comision_porcentaje < 0 ||
        formData.comision_porcentaje > 100
      ) {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al guardar el colaborador.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 className="flex items-center text-lg font-bold text-gray-900">
            <UserPlus className="text-primary mr-2 h-5 w-5" />
            Nuevo Colaborador
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nombre Completo *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nombre"
                  required
                  className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-400 transition-colors focus:ring-1 focus:outline-none sm:text-sm"
                  placeholder="Ej. Ana García"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="rol"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Rol / Especialidad *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="rol"
                  required
                  className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-gray-900 focus:ring-1 focus:outline-none sm:text-sm"
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Seleccionar Rol
                  </option>
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
              <label
                htmlFor="comision_porcentaje"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Porcentaje de Comisión (%) *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Percent className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="comision_porcentaje"
                  required
                  min="0"
                  max="100"
                  className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-400 transition-colors focus:ring-1 focus:outline-none sm:text-sm"
                  placeholder="30"
                  value={formData.comision_porcentaje}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      comision_porcentaje: Number(e.target.value),
                    })
                  }
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Este porcentaje se usará para calcular la ganancia del empleado
                por cada servicio facturado.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="focus:ring-primary rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
