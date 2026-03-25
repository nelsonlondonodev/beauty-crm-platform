import { ArrowRight, CalendarCheck, CheckCircle2, ChevronRight, Scissors, Store, Users, LogIn, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-purple-500/30 overflow-hidden font-sans">
      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Londy
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#caracteristicas" className="hover:text-primary transition-colors">Características</a>
            <a href="#beneficios" className="hover:text-primary transition-colors">Rentabilidad</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <LogIn className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Acceder</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (Glassmorphism & Floating Elements) ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Ambient Orbs */}
        <div className="absolute top-20 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-40 right-20 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-[100px] mix-blend-multiply delay-150" />
        <div className="absolute top-60 left-20 -z-10 h-[300px] w-[300px] rounded-full bg-pink-400/20 blur-[100px] mix-blend-multiply delay-300" />

        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Pill Badge */}
            <div className="mb-8 flex justify-center">
              <div className="relative inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-purple-800 shadow-sm backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>La plataforma V0.4 está aquí</span>
                <span className="absolute -inset-x-0 -inset-y-0 z-[-1] animate-pulse rounded-full border border-purple-300/50" />
              </div>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
              Domina la agenda, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
                eleva tu rentabilidad.
              </span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 font-medium">
              El CRM nativo diseñado para dueños de salones. Controla reservas, liquida comisiones en tiempo real y automatiza la fidelización de tus clientes.
            </p>

            {/* Floating Mini-Stats Cards around CTA */}
            <div className="relative mt-12 flex justify-center">
              <div className="absolute -left-12 top-4 hidden lg:flex animate-bounce md:flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl delay-100" style={{ animationDuration: '3s' }}>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-bold">Ticket Medio</p>
                  <p className="text-sm font-extrabold text-gray-900">+25% LTV</p>
                </div>
              </div>

              <div className="absolute -right-8 -top-8 hidden lg:flex animate-bounce md:flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl delay-300" style={{ animationDuration: '4s' }}>
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-bold">Multi-Rol</p>
                  <p className="text-sm font-extrabold text-gray-900">100% Seguro</p>
                </div>
              </div>

              {/* Main Call To Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  to="/login"
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-primary px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                  <span className="relative z-10">Iniciar Prueba Gratis</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#caracteristicas"
                  className="flex w-full sm:w-auto items-center justify-center rounded-full border-2 border-gray-200 bg-white/50 px-8 py-4 text-base font-bold text-gray-700 backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white"
                >
                  Ver funcionalidades
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Box Grid ── */}
      <section id="caracteristicas" className="py-24 sm:py-32 relative z-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-in fade-in zoom-in-95 duration-700">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Operación Autónoma</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Diseñado para escalar
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Despídete de la libreta y domina tu salón como una verdadera empresa B2B. Todo está hiperconectado para fluir.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((feature, index) => (
              <div 
                key={feature.name} 
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
              >
                {/* Decorative BG Gradient on Hover */}
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

      {/* ── Deep Value Proposition (Dark Gradient) ── */}
      <section id="beneficios" className="relative isolate overflow-hidden bg-slate-950 py-24 sm:py-32">
        {/* Dark Mode Background glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#3b0764_0%,transparent_50%)]" />
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl text-center leading-tight">
              Construye lealtad infinita usando <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Análisis Predictivo Local</span>
            </h2>
            <p className="mt-6 text-center text-lg leading-8 text-gray-300">
              Transforma visitantes en embajadores. Genera cupones de cumpleaños en tiempo real (QR instantáneo) a través de n8n, mide el Valor de Vida del Cliente (LTV) y mira qué tratamientos son los más rentables.
            </p>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 justify-center">
              {[
                'Historial LTV & Rentabilidad',
                'Integración Automática por WhatsApp',
                'Restricciones Multi-Rol por Seguridad',
                'Campañas a 6 meses Inteligentes'
              ].map((benefit) => (
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

      {/* ── Giant Footer CTA ── */}
      <footer className="bg-slate-950 pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="group relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-24 text-center shadow-2xl sm:px-16 transition-all hover:shadow-[0_0_80px_rgba(168,85,247,0.3)]">
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Es hora de digitalizar tu éxito.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/80">
              Lleva tu salón al 2026. Controla tu personal, agiliza tus ganancias y no pierdas ni un solo cliente.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-sm transition-transform hover:scale-105"
              >
                Inicia Sesión Ahora <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Background floating graphics for CTA */}
            <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] group-hover:scale-105 transition-transform duration-700" aria-hidden="true">
              <circle cx={512} cy={512} r={512} fill="url(#purple-gradient)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="purple-gradient">
                  <stop stopColor="#ffff" />
                  <stop offset={1} stopColor="#A855F7" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          
          <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
               <Scissors className="h-5 w-5 text-gray-400" />
               <span className="text-xl font-extrabold text-white">Londy</span>
            </div>
            <p className="text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Londy CRM &middot; Un producto SaaS premium B2B.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
