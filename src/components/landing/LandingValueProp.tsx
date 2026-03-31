import { CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  'Historial LTV & Rentabilidad',
  'Integración Automática por WhatsApp',
  'Restricciones Multi-Rol por Seguridad',
  'Campañas a 6 meses Inteligentes'
];

const LandingValueProp = () => {
  return (
    <section id="beneficios" className="relative isolate overflow-hidden bg-slate-950 py-24 sm:py-32">
      {/* Dark Mode Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#3b0764_0%,transparent_50%)]" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <header>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl text-center leading-tight">
              Construye lealtad infinita usando <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Análisis Predictivo Local</span>
            </h2>
            <p className="mt-6 text-center text-lg leading-8 text-gray-300">
              Transforma visitantes en embajadores. Genera cupones de cumpleaños en tiempo real (QR instantáneo) a través de n8n, mide el Valor de Vida del Cliente (LTV) y mira qué tratamientos son los más rentables.
            </p>
          </header>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 justify-center">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl backdrop-blur-md transition-colors hover:bg-white/10">
                <div className="rounded-full bg-primary/20 p-1">
                  <CheckCircle2 className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-gray-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingValueProp;
