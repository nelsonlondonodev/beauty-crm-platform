import React, { useState } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateTenantConfig } from '../../services/tenantService';

interface BrandConfigModalProps {
  onClose: () => void;
}

const BrandConfigModal = ({ onClose }: BrandConfigModalProps) => {
  const { config, refreshConfig } = useTenant();
  const { user } = useAuth();
  
  const [brandName, setBrandName] = useState(config.brandName || '');
  const [tagline, setTagline] = useState(config.tagline || '');
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await updateTenantConfig(user.id, {
        brandName,
        tagline,
        logoUrl
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
          <h3 className="text-lg font-bold text-gray-900">Marca y Apariencia</h3>
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

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="Ej. Mi Salón VIP"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Eslogan (Tagline)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="El mejor estilo para ti"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">URL del Logo (Opcional)</label>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Pega un enlace directo (URL con .png o .jpg) a tu logotipo en internet.</p>
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandConfigModal;
