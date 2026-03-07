import React, { useState } from 'react';
import { X, Save, Calculator, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateTenantConfig } from '../../services/tenantService';

interface BillingConfigModalProps {
  onClose: () => void;
}

const BillingConfigModal = ({ onClose }: BillingConfigModalProps) => {
  const { config, refreshConfig } = useTenant();
  const { user } = useAuth();
  
  const [commissionPolicy, setCommissionPolicy] = useState<'gross' | 'net'>(config.commissionPolicy || 'gross');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await updateTenantConfig(user.id, {
        commissionPolicy
      });
      await refreshConfig();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Políticas de Facturación</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-700">Cálculo de Comisiones</label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setCommissionPolicy('gross')}
                  className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    commissionPolicy === 'gross'
                      ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    commissionPolicy === 'gross' ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300'
                  }`}>
                    {commissionPolicy === 'gross' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">Sobre Precio Bruto</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      La comisión se calcula sobre el valor total del servicio, antes de cualquier descuento o cupón aplicado.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCommissionPolicy('net')}
                  className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    commissionPolicy === 'net'
                      ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    commissionPolicy === 'net' ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300'
                  }`}>
                    {commissionPolicy === 'net' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">Sobre Precio Neto</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      La comisión se calcula sobre el valor real cobrado al cliente (después de aplicar descuentos y bonos).
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
              <div className="flex gap-3">
                <Calculator className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Ejemplo:</strong> Un servicio de $50,000 con un cupón de $10,000. 
                  En <strong>Bruto</strong> se comisiona sobre $50k. En <strong>Neto</strong> se comisiona sobre $40k.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Política'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingConfigModal;
