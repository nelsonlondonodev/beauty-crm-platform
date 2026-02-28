import React, { useRef, useState } from 'react';
import { Mail, Calendar, LogOut, Edit2, Camera, Loader2, Check, X } from 'lucide-react';
import type { AppRole } from '../../contexts/AuthContext';

interface ProfileCardProps {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: AppRole | null;
  joinedDate: string;
  onLogout: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onUpdateName?: (newName: string) => Promise<void>;
}

const ProfileCard = ({ 
  fullName, 
  email, 
  avatarUrl, 
  role, 
  joinedDate, 
  onLogout,
  onAvatarUpload,
  onUpdateName
}: ProfileCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(fullName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatear nombre para mostrar (solo cuando no se está editando)
  const formattedName = fullName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarUpload) {
      try {
        setIsUploading(true);
        await onAvatarUpload(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === fullName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      if (onUpdateName) await onUpdateName(editName);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-purple-500/5 ring-1 ring-black/5 transition-all hover:shadow-purple-500/10">
      {/* Banner con Patrón Sutil */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500">
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="relative px-8 pb-8 mt-[-60px]">
        {/* Avatar Circular con Glow */}
        <div className="relative inline-block group/avatar">
          <div className="h-32 w-32 rounded-full bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-purple-600">
                  {fullName.substring(0, 1).toUpperCase()}
                </span>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <button 
            onClick={handleCameraClick}
            disabled={isUploading}
            className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-gray-600 transition-all hover:scale-110 hover:text-purple-600 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="w-full mr-4">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none bg-transparent py-1 px-0"
                    autoFocus
                    disabled={isSaving}
                  />
                  <button 
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditName(fullName); }}
                    disabled={isSaving}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">{formattedName}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm shadow-purple-200">
                      {role || 'Staff'}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="text-xs font-medium text-gray-400">ID: USER-{fullName.substring(0, 4).toUpperCase()}</span>
                  </div>
                </>
              )}
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all hover:border-purple-200 hover:text-purple-600 hover:shadow-sm"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-gray-50/30 p-4 transition-colors hover:bg-gray-50/60">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Principal</span>
              <span className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">{email}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-gray-50/30 p-4 transition-colors hover:bg-gray-50/60">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Calendar className="h-5 w-5 text-pink-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Miembro Desde</span>
              <span className="text-sm font-semibold text-gray-700">{joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button 
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión Segura
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;


