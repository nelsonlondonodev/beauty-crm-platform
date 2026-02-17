import React from 'react';
import { Bell, Search } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger would go here */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 sm:text-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
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
