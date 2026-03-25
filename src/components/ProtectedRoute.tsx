import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type AppRole } from '../contexts/AuthContext';
import { Loader2, Lock } from 'lucide-react';

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
    case 'superadmin':
      return '/admin'; // Dashboard global
    case 'staff':
      return '/calendar'; // Vista ideal para empleados base
    case 'admin':
    case 'owner':
      return '/dashboard'; // El dashboard es su base de operaciones
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

  // Si hay sesión pero no hay un rol asignado después de cargar,
  // detenemos el flujo para evitar bucle de redirecciones.
  if (!role && !loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Acceso Pendiente de Rol
          </h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido autenticada, pero aún no tiene un rol asignado para este salón.
            Por favor, contacta al administrador del sistema para habilitar tu acceso.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="text-primary font-semibold hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // Verifica si la ruta requiere roles específicos y el usuario los tiene
  if (allowedRoles) {
    const userRole = role!; // Sabemos que role no es null aquí por la guarda anterior
    if (!allowedRoles.includes(userRole)) {
      const fallbackRoute = getFallbackRoute(role);
      
      // VITAL: Prevenir bucles infinitos de redirección si la ruta de fallback es la actual
      if (window.location.pathname === fallbackRoute) {
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Acceso Restringido
            </h2>
            <p className="text-gray-500">
              No cuentas con los permisos necesarios para ver esta sección ({userRole}).
            </p>
          </div>
        );
      }
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
