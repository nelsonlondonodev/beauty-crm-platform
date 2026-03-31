import { TrendingUp, ShieldCheck } from 'lucide-react';

const HeroVisuals = () => (
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
);

export default HeroVisuals;
