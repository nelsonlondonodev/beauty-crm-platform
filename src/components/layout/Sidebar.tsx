import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Scissors,
  Receipt,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Briefcase, label: 'Personal', path: '/staff' },
    { icon: Receipt, label: 'Facturación / POS', path: '/billing' },
    { icon: Calendar, label: 'Agenda', path: '/calendar' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white/80 backdrop-blur-xl transition-transform md:translate-x-0">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Scissors size={24} />
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">
            Beauty CRM
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary shadow-primary/25 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <div className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
