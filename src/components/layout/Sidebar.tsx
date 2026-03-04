import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  Receipt,
  Briefcase,
  Gift,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth, type AppRole } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { hasRequiredRole } from '../../lib/rbac';

// ── Tipos ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  allowedRoles: AppRole[];
}

// ── Configuración de navegación ─────────────────────────────────────────────

const DASHBOARD_PATH = '/';

const NAV_ITEMS: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: DASHBOARD_PATH,
    allowedRoles: ['owner', 'admin'],
  },
  {
    icon: Users,
    label: 'Clientes',
    path: '/clients',
    allowedRoles: ['owner', 'admin', 'staff'],
  },
  {
    icon: Gift,
    label: 'Validar Bonos',
    path: '/bonuses',
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

// ── Estilos del Sidebar ─────────────────────────────────────────────────────

const STYLES = {
  base: 'group relative flex items-center overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
  activeDashboard: 'bg-primary shadow-primary/25 text-white shadow-lg',
  activeGradient: 'bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25',
  inactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
} as const;

/**
 * Resuelve las clases CSS del NavLink según su estado activo y tipo.
 */
const getNavLinkClassName = (isActive: boolean, isDashboard: boolean): string =>
  cn(
    STYLES.base,
    isActive
      ? isDashboard
        ? STYLES.activeDashboard
        : STYLES.activeGradient
      : STYLES.inactive
  );

// ── Componente ──────────────────────────────────────────────────────────────

const Sidebar = () => {
  const { role } = useAuth();
  const { config } = useTenant();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [config.logoUrl]);

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    hasRequiredRole(role, item.allowedRoles)
  );

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white/80 backdrop-blur-xl transition-transform md:translate-x-0">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shrink-0">
            {config.logoUrl && !imgError ? (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                className="h-full w-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <Scissors size={24} />
            )}
          </div>
          <span className="ml-3 text-xl font-bold tracking-tight text-gray-900 truncate">
            {config.brandName}
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredNavItems.map((item) => {
            const isDashboard = item.path === DASHBOARD_PATH;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={isDashboard}
                className={({ isActive }) =>
                  getNavLinkClassName(isActive, isDashboard)
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
