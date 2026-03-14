import { Banknote, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: 'efectivo' | 'tarjeta') => void;
}

const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-semibold text-gray-700">
        Método de Pago
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('efectivo')}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all",
            value === 'efectivo'
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100"
          )}
        >
          <Banknote className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Efectivo
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange('tarjeta')}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all",
            value === 'tarjeta'
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100"
          )}
        >
          <CreditCard className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Tarjeta
          </span>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
