import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Gift, Search, Tag, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Bonuses = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: { id: string; codigo: string; tipo: string; estado: string; client_id: string; clientes_fidelizacion?: { nombre: string } | null };
  } | null>(null);

  const handleValidate = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    setResult(null);

    try {
      const { data: bonoData, error } = await supabase
        .from('bonos')
        .select(`
          id, codigo, tipo, estado,
          client_id,
          clientes_fidelizacion (nombre)
        `)
        .eq('codigo', couponCode)
        .single();

      if (error || !bonoData) throw new Error('Cupón no encontrado o código incorrecto.');
      if (bonoData.estado !== 'Pendiente') {
         throw new Error(`El cupón se encuentra en estado: ${bonoData.estado}.`);
      }

      setResult({
        success: true,
        message: '¡Cupón válido y listo para canjear!',
        data: {
          ...bonoData,
          clientes_fidelizacion: Array.isArray(bonoData.clientes_fidelizacion) 
            ? bonoData.clientes_fidelizacion[0] 
            : bonoData.clientes_fidelizacion
        } as unknown as { id: string; codigo: string; tipo: string; estado: string; client_id: string; clientes_fidelizacion?: { nombre: string } | null },
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
      const { error } = await supabase
        .from('bonos')
        .update({
          estado: 'Canjeado',
          fecha_canje: new Date().toISOString(),
        })
        .eq('id', result.data.id);

      if (error) throw new Error(error.message);

      setResult({
        success: true,
        message: '¡Bono canjeado exitosamente!',
      });
      setCouponCode('');
      
    } catch (e: unknown) {
      setResult({
        success: false,
        message: 'Error al canjear: ' + (e instanceof Error ? e.message : 'Desconocido'),
        data: result.data // keep data so they can try again if network error
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Validación de Bonos"
        subtitle="Verifica y canjea los cupones de fidelización de los clientes."
      />

      <div className="mx-auto mt-8 max-w-xl">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
               <Gift className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Validar Código</h2>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa el código que te proporcione el cliente, ya sea de su regalo de cumpleaños o de su bono de bienvenida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative flex-1">
                <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: NARBO-KZ92pe"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-4 pl-10 uppercase text-gray-900 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                />
             </div>
             <button
               onClick={handleValidate}
               disabled={!couponCode || isValidating}
               className="flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-all hover:bg-gray-800 disabled:bg-gray-400 sm:w-auto"
             >
               {isValidating ? 'Buscando...' : (
                 <>
                   <Search className="mr-2 h-4 w-4" />
                   Buscar
                 </>
               )}
             </button>
          </div>

          {result && (
            <div className={`mt-8 rounded-lg border p-6 transition-all ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
               <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {result.success ? (
                       <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                       <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                     <h3 className={`text-lg font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                       {result.message}
                     </h3>
                     
                     {result.data && (
                       <div className="mt-4 rounded-md bg-white p-4 shadow-sm border border-green-100 flex flex-col gap-2 text-sm text-gray-700">
                         <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                            <span className="font-semibold text-gray-500 col-span-1">Cliente:</span>
                            <span className="col-span-2">{result.data.clientes_fidelizacion?.nombre}</span>
                         </div>
                         <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                            <span className="font-semibold text-gray-500 col-span-1">Tipo de Bono:</span>
                            <span className="col-span-2 font-medium">{result.data.tipo}</span>
                         </div>
                         <div className="grid grid-cols-3 gap-2 py-1">
                            <span className="font-semibold text-gray-500 col-span-1">Código:</span>
                            <span className="col-span-2 font-mono text-primary font-bold">{result.data.codigo}</span>
                         </div>
                         
                         <button
                           onClick={handleRedeem}
                           disabled={isValidating}
                           className="mt-6 w-full rounded-lg bg-green-600 py-3 text-center font-bold text-white transition-all hover:bg-green-700"
                         >
                           Redimir Bono Ahora
                         </button>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Bonuses;
