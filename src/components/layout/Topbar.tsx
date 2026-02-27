import { Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import UserMenu from './UserMenu';
import { useState } from 'react';

const Topbar = () => {
  const [showNotificationPing, setShowNotificationPing] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger would go here */}
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowNotificationPing(false)}
          className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 active:scale-90"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {showNotificationPing && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </span>
          )}
        </button>

        <UserMenu />
      </div>
    </header>
  );
};

export default Topbar;
