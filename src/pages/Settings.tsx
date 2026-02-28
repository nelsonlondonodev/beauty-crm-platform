import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Shield, Bell, Building, User, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || 'Usuario de Londy';
  const email = user?.email || 'No disponible';
  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recientemente';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader
        title="Configuración"
        subtitle="Administra tu perfil personal y las preferencias de tu negocio."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Perfil del Usuario */}
        <div className="lg:col-span-1 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5">
            <div className="h-32 bg-gradient-to-tr from-purple-600 to-pink-500" />
            <div className="px-6 pb-6 mt-[-40px]">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-xl">
                  <div className="h-full w-full rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-purple-600">
                    {fullName.substring(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    {role || 'Staff'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Email</span>
                    <span className="truncate">{email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Miembro desde</span>
                    <span>{joinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/50 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:shadow-sm active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Configuraciones del Sistema */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Gestión de Negocio
            </h3>
            
            <div className="grid gap-4">
              <button className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Perfil de la Empresa</h4>
                    <p className="text-sm text-gray-500">Horarios, dirección e información básica.</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold text-gray-400">PRÓXIMAMENTE</span>
              </button>

              <button className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Seguridad y Permisos</h4>
                    <p className="text-sm text-gray-500">Cambiar contraseña y gestionar usuarios.</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold text-gray-400">PRÓXIMAMENTE</span>
              </button>

              <button className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Centro de Notificaciones</h4>
                    <p className="text-sm text-gray-500">Alertas de citas y recordatorios por WhatsApp/Email.</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold text-gray-400">PRÓXIMAMENTE</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">¿Necesitas ayuda con tu cuenta?</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Si deseas cambiar tu correo electrónico principal o tienes problemas de acceso, por favor contacta a soporte técnico de Londy.
                </p>
                <button className="mt-4 text-sm font-bold text-purple-600 hover:text-purple-700">
                  Contactar Soporte →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

