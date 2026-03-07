import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import ProfileCard from '../components/settings/ProfileCard';
import { uploadAvatar, removeAvatar, updateUserInfo } from '../services/userService';
import { getAvatarUrl } from '../lib/avatar';
import { APP_CONFIG } from '../config/brand';
import { logger } from '../lib/logger';

const Profile = () => {
  const { user, role, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();

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
      logger.error('Error in handleAvatarUpload', error, 'Profile');
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
      logger.error('Error in handleAvatarRemove', error, 'Profile');
      alert('Error al eliminar la imagen.');
    }
  };

  const handleUpdateName = async (newName: string) => {
    try {
      await updateUserInfo({ full_name: newName });
      await refreshUser(); // Forzar actualización de metadata en la UI
    } catch (error) {
      logger.error('Error in handleUpdateName', error, 'Profile');
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader
        title="Mi Perfil"
        subtitle="Administra tu información personal y de seguridad."
      />

      <div className="grid grid-cols-1 gap-8">
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
    </div>
  );
};

export default Profile;
