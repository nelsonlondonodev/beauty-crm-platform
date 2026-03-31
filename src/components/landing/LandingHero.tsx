import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import HeroBackground from './HeroBackground';
import HeroVisuals from './HeroVisuals';
import HeroStatItem from './HeroStatItem';

const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-56">
      <HeroBackground />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          
          {/* ── Content Column ── */}
          <article className="relative z-10 text-center lg:text-left">
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              {/* Premium Pill Badge */}
              <div className="mb-8 flex justify-center lg:justify-start">
                <div className="relative inline-flex items-center gap-2 rounded-full border border-purple-200/50 bg-white/40 px-4 py-1.5 text-sm font-bold text-purple-800 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="tracking-wide uppercase text-[10px]">Nueva Era V1.0</span>
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
                 <HeroStatItem value="+45%" label="Rentabilidad" />
                 <HeroStatItem value="100%" label="Fidelización" />
                 <HeroStatItem value="-5h" label="Admin Semanal" showDivider={false} />
              </div>
            </div>
          </article>

          {/* ── Visual Column ── */}
          <HeroVisuals />
          
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
