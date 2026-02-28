import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  Receipt,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth, type AppRole } from '../../contexts/AuthContext';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  allowedRoles: AppRole[];
}

const Sidebar = () => {
  const { role } = useAuth();

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      allowedRoles: ['owner', 'admin'],
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clients',
      allowedRoles: ['owner', 'admin', 'staff'],
    },
    {
      icon: Briefcase,
      label: 'Personal',
      path: '/staff',
      allowedRoles: ['owner', 'admin'],
    },
    {
      icon: Receipt,
      label: 'Facturación / POS',
      path: '/billing',
      allowedRoles: ['owner', 'admin', 'staff'],
    },
    {
      icon: Calendar,
      label: 'Agenda',
      path: '/calendar',
      allowedRoles: ['owner', 'admin', 'staff'],
    },
  ];

  // Filtramos los items basándonos en el rol actual del usuario logueado
  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(role || 'staff')
  );

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white/80 backdrop-blur-xl transition-transform md:translate-x-0">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Scissors size={24} />
          </div>
          <span className="ml-3 text-xl font-bold tracking-tight text-gray-900">
            Londy
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredNavItems.map((item) => (
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


      </div>
    </aside>
  );
};

export default Sidebar;
