import React, { useState } from 'react';
import { X, Store, User, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { createTenant, type CreateTenantPayload } from '../../services/adminService';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewTenantModal = ({ isOpen, onClose, onSuccess }: NewTenantModalProps) => {
  const [formData, setFormData] = useState<CreateTenantPayload>({
    brandName: '',
    ownerId: '',
    plan: 'Premium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica de UUID (formato simplificado)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.ownerId)) {
      setError('El ID del Propietario debe ser un UUID válido de Supabase.');
      return;
    }

    if (formData.brandName.trim().length < 3) {
      setError('El nombre del salón debe tener al menos 3 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await createTenant(formData);
      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({ brandName: '', ownerId: '', plan: 'Premium' });
      } else {
        setError(result.error || 'Ocurrió un error al registrar el salón.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Salón</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Store className="h-3.5 w-3.5" />
              Nombre de la Marca / Salón
            </label>
            <input
              required
              type="text"
              placeholder="Ej: Narbo's Salón Spa"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              ID del Propietario (UUID)
            </label>
            <input
              required
              type="text"
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value.trim() })}
            />
            <p className="text-[10px] text-gray-500 italic">
              Obtén este ID desde el panel de Authentication en Supabase.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" />
              Plan de Suscripción
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="Básico">Plan Básico</option>
              <option value="Premium">Plan Premium</option>
              <option value="Enterprise">Plan Enterprise</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Registro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTenantModal;
