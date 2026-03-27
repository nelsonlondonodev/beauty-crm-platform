import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Gift, Search, Tag, CheckCircle, XCircle } from 'lucide-react';
import {
  validateBonoCode,
  redeemBono,
  type ValidatedBono,
} from '../services/bonoService';
import { emitCrmEvent, CRM_EVENTS } from '../lib/events';
import RedemptionHistory from '../components/bonuses/RedemptionHistory';

const Bonuses = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: ValidatedBono;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleValidate = async () => {
    const cleanCode = couponCode.trim();
    if (!cleanCode) return;
    setIsValidating(true);
    setResult(null);
    setShowConfirmation(false);

    try {
      const bono = await validateBonoCode(cleanCode);

      setResult({
        success: true,
        message: '¡Cupón válido y listo para canjear!',
        data: bono,
      });
    } catch (e: unknown) {
      setResult({
        success: false,
        message: e instanceof Error ? e.message : 'Error desconocido',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedeem = async () => {
    if (!result?.data?.id) return;
    setIsValidating(true);

    try {
      await redeemBono(result.data.id);

      setResult({
        success: true,
        message: '¡Bono canjeado exitosamente!',
      });
      setCouponCode('');

      // Notificar a otros módulos (Clientes, Dashboard) para refrescar datos
      emitCrmEvent(CRM_EVENTS.BONO_REDEEMED);
    } catch (e: unknown) {
      setResult({
        success: false,
        message:
          'Error al canjear: ' +
          (e instanceof Error ? e.message : 'Desconocido'),
        data: result.data, // mantener datos para reintentar si falla la red
      });
    } finally {
      setIsValidating(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Validación de Bonos"
        subtitle="Verifica y canjea los cupones de fidelización de los clientes."
      />

      <div className="mx-auto mt-8 max-w-xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 shadow-inner">
               <Gift className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Validar Código</h2>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa el código del regalo de cumpleaños o del bono de bienvenida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative flex-1">
                <Tag className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: NARBO-KZ92pe"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-10 uppercase text-gray-900 font-mono focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all"
                />
             </div>
             <button
               onClick={handleValidate}
               disabled={!couponCode || isValidating}
               className="flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 sm:w-auto"
             >
               {isValidating ? '...' : (
                 <>
                   <Search className="mr-2 h-4 w-4" />
                   Buscar
                 </>
               )}
             </button>
          </div>

          {result && (
            <div className={`mt-10 rounded-2xl border p-1 transition-all animate-in fade-in zoom-in duration-300 ${result.success ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    {result.success ? (
                       <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                       <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <h3 className={`text-base font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.message}
                    </h3>
                  </div>
                  
                  {result.data && (
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col text-sm text-gray-700">
                      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cupón Detectado</span>
                        <span className="text-xs font-bold text-primary font-mono">{result.data.codigo}</span>
                      </div>
                      
                      <div className="p-6 space-y-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Cliente</span>
                          <span className="text-lg font-extrabold text-gray-900">{result.data.clientes_fidelizacion?.nombre}</span>
                        </div>
                        
                        <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3 border border-primary/10">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Beneficio</span>
                            <span className="text-sm font-bold text-primary">{result.data.tipo}</span>
                          </div>
                          <Gift className="h-5 w-5 text-primary opacity-60" />
                        </div>

                        {!showConfirmation ? (
                          <button
                            onClick={() => setShowConfirmation(true)}
                            disabled={isValidating}
                            className="w-full rounded-xl bg-gray-900 px-6 py-4 text-center font-bold text-white shadow-xl transition-all hover:bg-gray-800 active:scale-95 hover:shadow-2xl disabled:opacity-50"
                          >
                            Canjear Beneficio Ahora
                          </button>
                        ) : (
                          <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="text-xs font-semibold text-orange-800 text-center">
                              ¿Confirmar entrega del beneficio?
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleRedeem}
                                disabled={isValidating}
                                className="flex-1 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-green-700 disabled:bg-gray-400"
                              >
                                {isValidating ? '...' : 'Sí, confirmar'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      <RedemptionHistory />
    </div>
  );
};

export default Bonuses;
