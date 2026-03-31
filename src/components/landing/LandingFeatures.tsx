import { CalendarCheck, Users, Store } from 'lucide-react';

const FEATURES = [
  {
    name: 'Agenda Multi-Colaborador',
    description: 'Calendario pro con FullCalendar. Separa la vista de turnos por cada estilista y arrastra citas visualmente sin márgenes de error.',
    icon: CalendarCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  {
    name: 'Liquidación Inteligente',
    description: 'Cálculos en bruto o neto instantáneos. Mantén el porcentaje exacto de tus empleados actualizados y paga sus saldos pendientes a 0 en un clic.',
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
  },
  {
    name: 'Caja & Recibo Ecológico',
    description: 'El POS transaccional genera tickets inmaculados, redimiendo bonos automáticamente y permitiendo envíos por WhatsApp sin imprimir papel.',
    icon: Store,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
  },
];

const LandingFeatures = () => {
  return (
    <section id="caracteristicas" className="py-24 sm:py-32 relative z-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center animate-in fade-in zoom-in-95 duration-700">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Operación Autónoma</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Diseñado para escalar
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Despídete de la libreta y domina tu salón como una verdadera empresa B2B. Todo está hiperconectado para fluir.
          </p>
        </header>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div 
              key={feature.name} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-40 ${feature.bg}`} />
              
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg} transition-transform group-hover:scale-110`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.name}</h3>
                <p className="mt-4 text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
