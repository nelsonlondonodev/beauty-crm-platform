import { CalendarCheck, Users, Store, Zap, ShieldCheck, Heart } from 'lucide-react';

const FEATURES = [
  {
    name: 'Agenda Multi-Colaborador',
    description: 'Calendario inteligente. Separa turnos por estilista y arrastra citas visualmente sin errores.',
    icon: CalendarCheck,
    gradient: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    delay: 'delay-0'
  },
  {
    name: 'Liquidación Inteligente',
    description: 'Cálculos de comisiones brutos o netos en tiempo real. Paga tus saldos en un solo clic.',
    icon: Users,
    gradient: 'from-purple-600 to-pink-500',
    shadow: 'shadow-purple-500/20',
    delay: 'delay-150'
  },
  {
    name: 'Caja & Recibo Eco',
    description: 'Genera tickets impecables a WhatsApp. Redime bonos automáticamente sin papel.',
    icon: Store,
    gradient: 'from-emerald-600 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    delay: 'delay-300'
  },
  {
    name: 'Análisis de LTV',
    description: 'Conoce cuánto vale realmente cada clienta. Toma decisiones basadas en rentabilidad pura.',
    icon: Zap,
    gradient: 'from-orange-600 to-amber-500',
    shadow: 'shadow-orange-500/20',
    delay: 'delay-[450ms]'
  },
  {
    name: 'Seguridad Multi-Rol',
    description: 'Define quién puede ver qué. Roles de Staff, Administrador y Dueño 100% blindados.',
    icon: ShieldCheck,
    gradient: 'from-indigo-600 to-blue-500',
    shadow: 'shadow-indigo-500/20',
    delay: 'delay-[600ms]'
  },
  {
    name: 'Lealtad Emotiva',
    description: 'Bonos de cumpleaños y bienvenida automáticos. Fideliza el corazón de tus clientas.',
    icon: Heart,
    gradient: 'from-rose-600 to-red-400',
    shadow: 'shadow-rose-500/20',
    delay: 'delay-[750ms]'
  },
];

const LandingFeatures = () => {
  return (
    <section id="caracteristicas" className="relative z-20 overflow-hidden py-24 sm:py-32">
      {/* Background Decorative FX */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-50/50 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-black uppercase tracking-widest text-primary">
              Infraestructura Elite
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl">
            Diseñado para escalar <br />
            <span className="text-muted-foreground font-medium italic">sin fricciones</span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 font-medium leading-relaxed">
            Concentra todo el poder de tu salón en una sola neurona digital. <br className="hidden lg:block" />
            Desde la agenda hasta la rentabilidad LTV, Londy fluye contigo.
          </p>
        </header>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div 
              key={feature.name} 
              className={`group relative flex animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both ${feature.delay} flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm transition-all hover:-translate-y-2 hover:border-gray-200 hover:shadow-2xl ${feature.shadow}`}
            >
              {/* Corner Glow Overlay */}
              <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-60 bg-gradient-to-br ${feature.gradient}`} />
              
              <div className="relative z-10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <feature.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>
                
                <h3 className="mt-8 text-2xl font-black text-gray-900 leading-tight">
                  {feature.name}
                </h3>
                
                <p className="mt-4 text-base font-medium leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Interactive Indicator */}
              <div className="mt-8 flex h-1 w-12 rounded-full bg-gray-100 transition-all duration-500 group-hover:h-1.5 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
