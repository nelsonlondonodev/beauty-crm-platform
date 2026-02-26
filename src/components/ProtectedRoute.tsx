import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type AppRole } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

/**
 * Función pura que determina la ruta de respaldo según el rol.
 * Evita la creación de componentes monolíticos y facilita pruebas unitarias.
 */
const getFallbackRoute = (role: AppRole | null): string => {
  if (!role) return '/login';

  switch (role) {
    case 'staff':
      return '/calendar'; // Vista ideal para empleados base
    case 'admin':
    case 'owner':
      return '/'; // El dashboard es su base de operaciones
    default:
      return '/calendar';
  }
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Verifica si la ruta requiere roles específicos y el usuario los tiene
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // En lugar de enviarlos obligatoriamente a /calendar, los dirige a su ruta principal ideal
    const fallbackRoute = getFallbackRoute(role);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
