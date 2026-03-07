import GlobalSearch from './GlobalSearch';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';

const Topbar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger would go here */}
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <NotificationMenu />
        <UserMenu />
      </div>
    </header>
  );
};

export default Topbar;
