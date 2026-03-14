import { DollarSign } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { Client, InvoiceItem } from '../../types';
import { cn } from '../../lib/utils';
import type { BillingFormValues } from '../../schemas/billingSchema';
import PaymentMethodSelector from './PaymentMethodSelector';

interface BillingCheckoutSummaryProps {
  form: UseFormReturn<BillingFormValues>;
  selectedClient: Client | null;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  isProcessing: boolean;
  couponCode: string;
  setCouponCode: (c: string) => void;
  validatingCoupon: boolean;
  appliedBonus: { id: string; codigo?: string; tipo: string } | null;
  setAppliedBonus: (b: { id: string; codigo?: string; tipo: string } | null) => void;
  handleValidateCoupon: (c: string) => void;
  handleApplyClientBonus: (id: string, tipo: string, codigo?: string) => void;
}

const BillingCheckoutSummary = ({
  form,
  selectedClient,
  items,
  subtotal,
  total,
  isProcessing,
  couponCode,
  setCouponCode,
  validatingCoupon,
  appliedBonus,
  setAppliedBonus,
  handleValidateCoupon,
  handleApplyClientBonus,
}: BillingCheckoutSummaryProps) => {
  const currentPaymentMethod = form.watch('metodo_pago');

  return (
    <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center text-lg font-bold text-gray-900">
        <DollarSign className="text-primary mr-1 h-5 w-5" />
        Resumen de Cobro
      </h3>

      {/* Available Bonuses Widget (If Client Selected) */}
      {selectedClient?.bonos_historial &&
        selectedClient.bonos_historial.some(
          (b) => b.estado === 'pendiente'
        ) && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 text-xs font-bold tracking-wider text-green-800 uppercase">
              Bonos Disponibles
            </h4>
            <div className="space-y-2">
              {selectedClient.bonos_historial
                .filter((b) => b.estado === 'pendiente')
                .map((bono, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded border border-green-100 bg-white p-2 shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {bono.tipo}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleApplyClientBonus(bono.id, bono.tipo, bono.codigo)}
                      disabled={appliedBonus?.id === bono.id}
                      className={cn(
                        "rounded px-2 py-1 text-xs font-medium text-white transition-colors",
                        appliedBonus?.id === bono.id 
                           ? "bg-gray-400 cursor-not-allowed" 
                           : "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {appliedBonus?.id === bono.id ? 'Aplicado' : 'Aplicar'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Manual Coupon Input */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">Canjear Cupón Promocional</label>
        {appliedBonus ? (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-primary">{appliedBonus.tipo}</span>
               {appliedBonus.codigo && <span className="text-xs text-gray-500">{appliedBonus.codigo}</span>}
             </div>
             <button 
               type="button"
               onClick={() => {
                 setAppliedBonus(null);
                 form.setValue('bono_id', '');
               }} 
               className="text-xs font-medium text-red-500 hover:text-red-700"
             >
               Remover
             </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: NARBO-KZ92pe"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => handleValidateCoupon(couponCode)}
              disabled={!couponCode || validatingCoupon}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
            >
              {validatingCoupon ? '...' : 'Validar'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>{appliedBonus ? 'Desc. Automático (Bono)' : 'Descuento Manual'}</span>
          <div className="flex items-center">
            <span className="mr-1">$</span>
            <input
              type="number"
              disabled={!!appliedBonus}
              className="focus:border-primary w-24 rounded border border-gray-300 px-2 py-1 text-right outline-none disabled:bg-gray-100 disabled:text-gray-500"
              {...form.register('descuento_manual', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selection Component */}
      <PaymentMethodSelector 
        value={currentPaymentMethod}
        onChange={(val) => form.setValue('metodo_pago', val)}
      />

      <div className="mb-8 border-t border-gray-200 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-gray-900">
            Total a Pagar
          </span>
          <span className="text-primary text-3xl font-black">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={items.length === 0 || isProcessing}
        className={cn(
          'w-full rounded-xl py-4 text-lg font-bold shadow-lg transition-all',
          items.length === 0
            ? 'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none'
            : 'bg-primary hover:bg-primary/90 hover:shadow-primary/30 text-white',
          isProcessing ? 'cursor-not-allowed opacity-75' : ''
        )}
      >
        {isProcessing ? 'Procesando...' : 'Liquidar y Cobrar'}
      </button>
      <p className="mt-3 flex items-center justify-center text-center text-xs text-gray-400">
        Las facturas se guardan en el historial del CRM.
      </p>
    </div>
  );
};

export default BillingCheckoutSummary;
