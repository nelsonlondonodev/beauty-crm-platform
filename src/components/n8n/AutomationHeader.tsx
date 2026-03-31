import { Sparkles, ShieldCheck, Zap, Mail } from 'lucide-react';

const AutomationHeader = () => (
  <section className="animate-in fade-in slide-in-from-left-12 duration-1000">
    <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 w-fit">
      <Sparkles className="h-3 w-3" />
      <span>Pruebas Internas n8n</span>
    </div>
    <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1] sm:text-6xl">
      Prueba el flujo de <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic">Bienvenida Real-Time.</span>
    </h1>
    <p className="mt-8 text-lg text-gray-400 font-medium leading-relaxed">
      Al completar este formulario, n8n procesará tu entrada, la guardará en Supabase y generará un bono dinámico del 15% con un QR único de redención. 🚀
    </p>
    
    <div className="mt-12 space-y-4">
       {[
         { text: 'Conexión Segura vía Webhook', icon: ShieldCheck },
         { text: 'Generación Dinámica de Código QR', icon: Zap },
         { text: 'Email Marketing Vía n8n', icon: Mail }
       ].map((item) => (
         <div key={item.text} className="flex items-center gap-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:border-emerald-500/50">
              <item.icon className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-gray-300">{item.text}</span>
         </div>
       ))}
    </div>
  </section>
);

export default AutomationHeader;
