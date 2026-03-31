import { Link } from 'react-router-dom';
import { Scissors, LogIn } from 'lucide-react';

const LandingNavbar = () => {
  return (
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
  );
};

export default LandingNavbar;
