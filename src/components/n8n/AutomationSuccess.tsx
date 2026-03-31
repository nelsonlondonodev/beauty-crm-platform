import { CheckCircle } from 'lucide-react';

interface AutomationSuccessProps {
  onRetry: () => void;
}

const AutomationSuccess = ({ onRetry }: AutomationSuccessProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
    <div className="animate-in fade-in zoom-in duration-700">
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>
      <h1 className="text-4xl font-black text-white sm:text-5xl">¡Registro Exitoso!</h1>
      <p className="mt-6 text-xl text-gray-400 max-w-md">
        Los datos han viajado a n8n. Si el flujo es correcto, recibirás tu bono del **15% con código QR** en unos instantes. 🎉
      </p>
      <button 
        onClick={onRetry}
        className="mt-10 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20"
      >
        Volver a probar el flujo
      </button>
    </div>
  </div>
);

export default AutomationSuccess;
