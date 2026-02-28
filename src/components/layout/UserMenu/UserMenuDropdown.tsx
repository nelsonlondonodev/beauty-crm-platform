import { LogOut, User, Settings, Shield, Mail } from 'lucide-react';
import type { AppRole } from '../../../contexts/AuthContext';

interface UserMenuDropdownProps {
  fullName: string;
  email: string;
  role: AppRole | null;
  initials: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const UserMenuDropdown = ({ 
  fullName, 
  email, 
  role, 
  initials, 
  onNavigate, 
  onLogout 
}: UserMenuDropdownProps) => {
  return (
    <div className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200 z-50">
      <div className="relative border-b border-gray-50 bg-gray-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-purple-600 shadow-sm ring-1 ring-gray-100 uppercase">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {fullName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="h-3 w-3 text-purple-600" />
              <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase">
                {role || 'Staff'}
              </span>
            </div>
          </div>
        </div>
        {email && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>

      <div className="p-1.5">
        <button
          onClick={() => onNavigate('/settings')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 group"
        >
          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
            <User className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
          </div>
          <span className="font-medium">Mi Perfil</span>
        </button>
        <button
          onClick={() => onNavigate('/settings')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 group"
        >
          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
            <Settings className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
          </div>
          <span className="font-medium">Configuración</span>
        </button>
      </div>

      <div className="border-t border-gray-50 p-1.5 bg-gray-50/30">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 group"
        >
          <div className="h-8 w-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:bg-white transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenuDropdown;
