import { useState } from 'react';
import {
  Scissors,
  Building2,
  PercentCircle,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { updateTenantConfig } from '../../services/tenantService';
import { useStaff } from '../../hooks/useStaff';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const { user } = useAuth();
  const { refreshConfig } = useTenant();
  const { addStaff } = useStaff();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brandName: 'Mi Salón',
    logoUrl: '',
    commissionPolicy: 'gross' as 'gross' | 'net',
    staffName: '',
    staffRole: 'staff',
    staffCommission: 50,
  });

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Setup Tenant (Brand & Permissions)
      await updateTenantConfig(user.id, {
        brandName: formData.brandName,
        logoUrl: formData.logoUrl,
        commissionPolicy: formData.commissionPolicy,
      });

      // 2. Refresh Tenant context so layout updates brand name everywhere
      await refreshConfig();

      // 3. Create First Employee if provided
      if (formData.staffName.trim()) {
        await addStaff({
          nombre: formData.staffName,
          rol: formData.staffRole,
          comision_porcentaje: formData.staffCommission,
        });
      }

      toast.success('¡Salón configurado con éxito!', {
        description: 'Bienvenido a tu nuevo espacio de trabajo automatizado.',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      });

      // Close Wizard
      onComplete();

    } catch (error) {
      toast.error('Ocurrió un error al guardar tu configuración. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200">
        
        {/* Header Progress Bar */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Configuración Inicial
            </h2>
            <span className="text-sm font-semibold text-gray-400">Paso {step} de 3</span>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="relative min-h-[300px]">
            
            {/* Step 1: Branding */}
            <div className={`absolute inset-0 transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-primary flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tu Salón</h3>
                  <p className="text-sm text-gray-500">¿Cómo te conocen tus clientes?</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Comercial</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Ej: Elegance Spa & Beauty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logotipo (URL opcional)</label>
                  <div className="flex items-center gap-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full outline-none bg-transparent"
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Financial Policies */}
            <div className={`absolute inset-0 transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : step < 2 ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <PercentCircle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Política de Comisiones</h3>
                  <p className="text-sm text-gray-500">¿Cómo reportarás las ganancias a tu equipo?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({ ...formData, commissionPolicy: 'gross' })}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    formData.commissionPolicy === 'gross' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${formData.commissionPolicy === 'gross' ? 'text-emerald-700' : 'text-gray-900'}`}>Valor Bruto</span>
                    {formData.commissionPolicy === 'gross' && <Check className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-gray-600">Calculada antes de descuentos y comisiones de tarjetas. Favorece al estilista.</p>
                </div>

                <div 
                  onClick={() => setFormData({ ...formData, commissionPolicy: 'net' })}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    formData.commissionPolicy === 'net' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${formData.commissionPolicy === 'net' ? 'text-emerald-700' : 'text-gray-900'}`}>Valor Neto</span>
                    {formData.commissionPolicy === 'net' && <Check className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-gray-600">Considera base real de facturación del salón. Más control en costos fijos.</p>
                </div>
              </div>
            </div>

            {/* Step 3: First Employee */}
            <div className={`absolute inset-0 transition-all duration-500 ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tu Primer Colaborador</h3>
                  <p className="text-sm text-gray-500">Activa tu calendario añadiendo personal.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Ej: Laura estilista principal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rol Base</label>
                    <select
                      value={formData.staffRole}
                      onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="staff">Personal (Staff)</option>
                      <option value="admin">Administrador local</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">% Comisión Base</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.staffCommission}
                        onChange={(e) => setFormData({ ...formData, staffCommission: Number(e.target.value) })}
                        className="w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Atrás
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="group flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all active:scale-95"
            >
              Siguiente <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="group relative overflow-hidden flex items-center justify-center min-w-[140px] gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-primary/50 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Finalizar</span>
                  <CheckCircle2 className="h-4 w-4 relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
