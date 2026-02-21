
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Scissors,
  Receipt,
  Briefcase
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
    { icon: Calendar, label: 'Agenda', path: '/calendar', isPro: true },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  const handleProClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("¡Mejora a la versión PRO! La función de Agenda incluye reservaciones automáticas de clientes y gestión completa de tiempo, disponible con un cobro adicional. Contáctanos para activarlo.");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform md:translate-x-0 bg-white/80 backdrop-blur-xl border-r border-gray-200">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scissors size={24} />
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">Beauty CRM</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.isPro ? '#' : item.path}
              onClick={item.isPro ? handleProClick : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive && !item.isPro
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : item.isPro 
                      ? "text-gray-400 cursor-not-allowed bg-gray-50/50 hover:bg-gray-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", item.isPro ? "text-gray-400" : "")} />
              <div className="flex items-center flex-1 justify-between">
                <span>{item.label}</span>
                {item.isPro && (
                  <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200 uppercase tracking-wider">
                    Pro
                  </span>
                )}
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
