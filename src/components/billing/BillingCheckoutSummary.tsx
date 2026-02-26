import { DollarSign } from 'lucide-react';
import type { Client, InvoiceItem } from '../../types';
import { cn } from '../../lib/utils';

interface BillingCheckoutSummaryProps {
  selectedClient: Client | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  setDiscount: (discount: number) => void;
  total: number;
  onCheckout: () => void;
  isProcessing: boolean;
}

const BillingCheckoutSummary = ({
  selectedClient,
  items,
  subtotal,
  discount,
  setDiscount,
  total,
  onCheckout,
  isProcessing,
}: BillingCheckoutSummaryProps) => {
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
                    <button className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700">
                      Aplicar
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      <div className="mb-6 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Descuento Manual</span>
          <div className="flex items-center">
            <span className="mr-1">$</span>
            <input
              type="number"
              className="focus:border-primary w-20 rounded border border-gray-300 px-2 py-1 text-right outline-none"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

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
        disabled={items.length === 0 || isProcessing}
        onClick={onCheckout}
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
