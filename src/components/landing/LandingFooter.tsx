import { Link } from 'react-router-dom';
import { ChevronRight, Scissors } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-slate-950 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Giant CTA Card */}
        <section className="group relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-24 text-center shadow-2xl sm:px-16 transition-all hover:shadow-[0_0_80px_rgba(168,85,247,0.3)]">
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
        </section>
        
        {/* Bottom Credits */}
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
  );
};

export default LandingFooter;
