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
}

const BillingCheckoutSummary = ({ 
  selectedClient, 
  items, 
  subtotal, 
  discount, 
  setDiscount, 
  total 
}: BillingCheckoutSummaryProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        <DollarSign className="h-5 w-5 mr-1 text-primary" />
        Resumen de Cobro
      </h3>

      {/* Available Bonuses Widget (If Client Selected) */}
      {selectedClient?.bonos_historial && selectedClient.bonos_historial.some(b => b.estado === 'pendiente') && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Bonos Disponibles</h4>
          <div className="space-y-2">
            {selectedClient.bonos_historial.filter(b => b.estado === 'pendiente').map((bono, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-green-100 shadow-sm">
                <span className="text-sm font-medium text-gray-800">{bono.tipo}</span>
                <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-medium transition-colors">
                  Aplicar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>Descuento Manual</span>
          <div className="flex items-center">
            <span className="mr-1">$</span>
            <input 
              type="number" 
              className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:border-primary outline-none"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-8">
        <div className="flex justify-between items-baseline">
          <span className="text-base font-bold text-gray-900">Total a Pagar</span>
          <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
        </div>
      </div>

      <button 
        disabled={items.length === 0}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all",
          items.length === 0 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
            : "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30"
        )}
      >
        Liquidar y Cobrar
      </button>
      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center">
        Las facturas se guardan en el historial del CRM.
      </p>
    </div>
  );
};

export default BillingCheckoutSummary;
