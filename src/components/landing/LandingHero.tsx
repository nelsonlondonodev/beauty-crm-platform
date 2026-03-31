import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const LandingHero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Ambient Orbs */}
      <div className="absolute top-20 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply" />
      <div className="absolute top-40 right-20 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-[100px] mix-blend-multiply delay-150" />
      <div className="absolute top-60 left-20 -z-10 h-[300px] w-[300px] rounded-full bg-pink-400/20 blur-[100px] mix-blend-multiply delay-300" />

      <article className="mx-auto max-w-7xl px-6 text-center lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Pill Badge */}
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-purple-800 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>La plataforma V0.4 está aquí</span>
              <span className="absolute -inset-x-0 -inset-y-0 z-[-1] animate-pulse rounded-full border border-purple-300/50" />
            </div>
          </div>

          <header>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
              Domina la agenda, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
                eleva tu rentabilidad.
              </span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 font-medium">
              El CRM nativo diseñado para dueños de salones. Controla reservas, liquida comisiones en tiempo real y automatiza la fidelización de tus clientes.
            </p>
          </header>

          <div className="relative mt-12 flex justify-center">
            {/* Floating Mini-Stats Cards around CTA */}
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
      </article>
    </section>
  );
};

export default LandingHero;
