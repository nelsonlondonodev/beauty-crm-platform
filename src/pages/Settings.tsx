import DashboardHeader from '../components/layout/DashboardHeader';
import { Shield, Bell, Building } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Configuración"
        subtitle="Administra las preferencias de tu negocio y cuenta."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Perfil de Negocio (Placeholder) */}
        <div className="cursor-not-allowed rounded-xl border border-gray-200 bg-white p-6 opacity-75 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Building className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Perfil de Negocio
          </h3>
          <p className="text-sm text-gray-500">
            Configura nombre, dirección y horarios de atención.
          </p>
        </div>

        {/* Cuentas y Usuarios (Placeholder) */}
        <div className="cursor-not-allowed rounded-xl border border-gray-200 bg-white p-6 opacity-75 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Seguridad y Permisos
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona roles de empleados y accesos al sistema.
          </p>
        </div>

        {/* Notificaciones (Placeholder) */}
        <div className="cursor-not-allowed rounded-xl border border-gray-200 bg-white p-6 opacity-75 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Bell className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Notificaciones
          </h3>
          <p className="text-sm text-gray-500">
            Personaliza alertas de citas y recordatorios.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Módulo en desarrollo. Próximamente disponible.
      </div>
    </div>
  );
};

export default Settings;
