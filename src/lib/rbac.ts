import type { AppRole } from '../contexts/AuthContext';

/**
 * Define las acciones que requieren permisos específicos en la aplicación.
 */
export type AppAction = 
  | 'VIEW_DASHBOARD'
  | 'MANAGE_STAFF'
  | 'VIEW_CLIENTS'
  | 'MANAGE_CLIENTS'
  | 'DELETE_CLIENT'
  | 'REDEEM_BONUS'
  | 'VIEW_BILLING'
  | 'VIEW_CALENDAR'
  | 'EDIT_SETTINGS';

/**
 * Mapa de permisos por rol. 
 * Centraliza la lógica de negocio sobre quién puede hacer qué.
 */
const ROLE_PERMISSIONS: Record<AppRole, AppAction[]> = {
  owner: [
    'VIEW_DASHBOARD',
    'MANAGE_STAFF',
    'VIEW_CLIENTS',
    'MANAGE_CLIENTS',
    'DELETE_CLIENT',
    'REDEEM_BONUS',
    'VIEW_BILLING',
    'VIEW_CALENDAR',
    'EDIT_SETTINGS'
  ],
  admin: [
    'VIEW_DASHBOARD',
    'MANAGE_STAFF',
    'VIEW_CLIENTS',
    'MANAGE_CLIENTS',
    'DELETE_CLIENT',
    'REDEEM_BONUS',
    'VIEW_BILLING',
    'VIEW_CALENDAR',
    'EDIT_SETTINGS'
  ],
  staff: [
    'VIEW_CLIENTS',
    'MANAGE_CLIENTS',
    'REDEEM_BONUS',
    'VIEW_BILLING',
    'VIEW_CALENDAR'
  ]
};

/**
 * Verifica si un rol tiene permiso para realizar una acción específica.
 * @param role - El rol del usuario actual
 * @param action - La acción a validar
 */
export const canPerform = (role: AppRole | null, action: AppAction): boolean => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(action);
};

/**
 * Verifica si el rol actual es uno de los permitidos.
 * Útil para compatibilidad con lógica de navegación existente.
 */
export const hasRequiredRole = (currentRole: AppRole | null, allowedRoles: AppRole[]): boolean => {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
};
