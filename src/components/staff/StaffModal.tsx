import React, { useState, useEffect } from 'react';
import { X, UserPlus, Briefcase, Percent, UserCheck, UserMinus, UserCog } from 'lucide-react';
import type { Empleado } from '../../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: Partial<Empleado>) => Promise<void>;
  initialData?: Empleado | null;
}

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    comision_porcentaje: 30,
    activo: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        rol: initialData.rol,
        comision_porcentaje: initialData.comision_porcentaje,
        activo: initialData.activo ?? true,
      });
    } else {
      setFormData({
        nombre: '',
        rol: '',
        comision_porcentaje: 30,
        activo: true,
      });
    }
  }, [initialData, isOpen]);
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

      // Reset form happens in useEffect now
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
            {initialData ? (
              <UserCog className="text-primary mr-2 h-5 w-5" />
            ) : (
              <UserPlus className="text-primary mr-2 h-5 w-5" />
            )}
            {initialData ? 'Editar Colaborador' : 'Nuevo Colaborador'}
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

            {initialData && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Estado del Empleado</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                  className={`relative flex w-full items-center justify-between rounded-lg border p-3 transition-colors ${
                    formData.activo
                      ? 'border-green-200 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${formData.activo ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                      {formData.activo ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {formData.activo ? 'Activo (Puede recibir comisiones)' : 'Inactivo (No disponible en el sistema)'}
                      </p>
                    </div>
                  </div>
                  {/* Toggle switch visual */}
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${formData.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.activo ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            )}
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
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Colaborador' : 'Guardar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
