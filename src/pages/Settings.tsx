import DashboardHeader from '../components/layout/DashboardHeader';
import { Shield, Bell, Building } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Configuración" 
        subtitle="Administra las preferencias de tu negocio y cuenta."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Perfil de Negocio (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-not-allowed opacity-75">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Building className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil de Negocio</h3>
            <p className="text-sm text-gray-500">Configura nombre, dirección y horarios de atención.</p>
        </div>

        {/* Cuentas y Usuarios (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-not-allowed opacity-75">
            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad y Permisos</h3>
            <p className="text-sm text-gray-500">Gestiona roles de empleados y accesos al sistema.</p>
        </div>

        {/* Notificaciones (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-not-allowed opacity-75">
            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-4">
                <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notificaciones</h3>
            <p className="text-sm text-gray-500">Personaliza alertas de citas y recordatorios.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500 mt-8">
          Módulo en desarrollo. Próximamente disponible.
      </div>
    </div>
  );
};

export default Settings;
