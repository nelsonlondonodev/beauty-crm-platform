
import { Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const Topbar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger would go here */}
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 ring-2 ring-white ring-offset-2 ring-offset-gray-100" />
      </div>
    </header>
  );
};

export default Topbar;
