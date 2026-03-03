import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Building, User, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/settings/ProfileCard';
import SettingsLink from '../components/settings/SettingsLink';
import BrandConfigModal from '../components/settings/BrandConfigModal';
import { uploadAvatar, removeAvatar, updateUserInfo } from '../services/userService';
import { getAvatarUrl } from '../lib/avatar';
import { APP_CONFIG } from '../config/brand';
import { logger } from '../lib/logger';

const Settings = () => {
  const { user, role, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      await uploadAvatar(user.id, file);
      await refreshUser();
    } catch (error) {
      logger.error('Error in handleAvatarUpload', error, 'Settings');
      const message = error instanceof Error ? error.message : 'Error al subir la imagen.';
      alert(message);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    try {
      await removeAvatar(user.id);
      await refreshUser();
    } catch (error) {
      logger.error('Error in handleAvatarRemove', error, 'Settings');
      alert('Error al eliminar la imagen.');
    }
  };

  const handleUpdateName = async (newName: string) => {
    try {
      await updateUserInfo({ full_name: newName });
      await refreshUser(); // Forzar actualización de metadata en la UI
    } catch (error) {
      logger.error('Error in handleUpdateName', error, 'Settings');
      alert('Error al actualizar el nombre.');
    }
  };

  const fullName = user?.user_metadata?.full_name || APP_CONFIG.defaults.userFullName;
  const email = user?.email || 'No disponible';
  const avatarUrl = getAvatarUrl(user);
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
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard
            fullName={fullName}
            email={email}
            avatarUrl={avatarUrl}
            role={role}
            joinedDate={joinedDate}
            onLogout={handleLogout}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            onUpdateName={handleUpdateName}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Gestión de Negocio
            </h3>
            
            <div className="grid gap-4">
              <SettingsLink 
                icon={Building}
                title="Marca y Apariencia"
                description="Personaliza el nombre de tu negocio y el logotipo."
                colorClass="bg-blue-50 text-blue-600"
                onClick={() => setIsBrandModalOpen(true)}
              />
              <SettingsLink 
                icon={Shield}
                title="Seguridad y Permisos"
                description="Cambiar contraseña y gestionar usuarios."
                badge="PRÓXIMAMENTE"
                colorClass="bg-indigo-50 text-indigo-600"
              />
              <SettingsLink 
                icon={Bell}
                title="Centro de Notificaciones"
                description="Alertas de citas y recordatorios por WhatsApp/Email."
                badge="PRÓXIMAMENTE"
                colorClass="bg-amber-50 text-amber-600"
              />
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
                  {APP_CONFIG.legal.supportText}
                </p>
                <button className="mt-4 text-sm font-bold text-purple-600 hover:text-purple-700">
                  Contactar Soporte →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isBrandModalOpen && (
        <BrandConfigModal onClose={() => setIsBrandModalOpen(false)} />
      )}
    </div>
  );
};

export default Settings;



