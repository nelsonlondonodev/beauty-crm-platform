import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type AppRole } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

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

  // Verifica si la ruta requiere roles específicos y si el usuario los tiene
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Si es un empleado (staff) intentando acceder al Dashboard u otra ruta prohibida,
    // se le redirige por defecto a su vista principal (Agenda)
    return <Navigate to="/calendar" replace />;
  }

  return children;
};

export default ProtectedRoute;
