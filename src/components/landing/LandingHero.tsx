import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-56">
      {/* ── Background Ambient FX ── */}
      <div className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] translate-x-1/3 -translate-y-1/3 rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/2 left-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px] mix-blend-multiply opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          
          {/* ── Content Column ── */}
          <article className="relative z-10 text-center lg:text-left">
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              {/* Premium Pill Badge */}
              <div className="mb-8 flex justify-center lg:justify-start">
                <div className="relative inline-flex items-center gap-2 rounded-full border border-purple-200/50 bg-white/40 px-4 py-1.5 text-sm font-bold text-purple-800 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="tracking-wide uppercase text-[10px]">Nueva Era V0.4</span>
                  <div className="absolute -inset-0.5 -z-10 animate-pulse rounded-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20 blur-sm" />
                </div>
              </div>

              <header>
                <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl lg:leading-[1.1]">
                  Domina la agenda, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-primary to-indigo-600 animate-gradient">
                    eleva tu marca.
                  </span>
                </h1>
                
                <p className="mt-8 text-lg leading-[1.6] text-gray-600 font-medium sm:text-xl lg:max-w-xl">
                  Software especializado para dueños de salones que buscan escalabilidad. Automatiza tus comisiones, agenda y fidelización en una sola plataforma de alto rendimiento.
                </p>
              </header>

              <div className="relative mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  to="/login"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gray-900 px-8 py-5 text-base font-bold text-white shadow-2xl transition-all hover:scale-[1.03] hover:shadow-purple-500/20 sm:w-auto"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
                   <span className="relative z-10">Probar Londy Gratis</span>
                   <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <a
                  href="#caracteristicas"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-white/50 px-8 py-5 text-base font-bold text-gray-700 backdrop-blur-xl transition-all hover:border-purple-200 hover:bg-white sm:w-auto"
                >
                  Ver funcionalidades
                </a>
              </div>
              
              {/* Rapid Stats Summary */}
              <div className="mt-12 flex flex-wrap justify-center gap-8 lg:justify-start border-t border-gray-100 pt-8 opacity-70">
                 <div>
                   <p className="text-2xl font-bold text-gray-900">+45%</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Rentabilidad</p>
                 </div>
                 <div className="h-10 w-px bg-gray-200" />
                 <div>
                   <p className="text-2xl font-bold text-gray-900">100%</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Fidelización</p>
                 </div>
                 <div className="h-10 w-px bg-gray-200" />
                 <div>
                   <p className="text-2xl font-bold text-gray-900">-5h</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Admin Semanal</p>
                 </div>
              </div>
            </div>
          </article>

          {/* ── Visual Column ── */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            {/* Main Mockup Image */}
            <div className="relative z-20 overflow-hidden rounded-[2.5rem] border-[8px] border-white/20 bg-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
              <img 
                src="/assets/hero-mockup.png" 
                alt="Londy CRM Dashboard Preview" 
                className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Floating Glossy Stats Cards */}
            <div className="absolute -top-10 -right-8 z-30 hidden xl:block animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-4 rounded-3xl border border-white/40 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Ingresos hoy</p>
                  <p className="text-lg font-black text-gray-900">$1.250.000</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -left-12 z-30 hidden xl:block animate-bounce" style={{ animationDuration: '5s' }}>
              <div className="flex items-center gap-4 rounded-3xl border border-white/40 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                  <ShieldCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Seguridad</p>
                  <p className="text-lg font-black text-gray-900">Multi-Sede OK</p>
                </div>
              </div>
            </div>

            {/* Decorative Orbs inside Visual Column */}
            <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20 blur-3xl opacity-50" />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
