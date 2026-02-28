import { Mail, Calendar, LogOut } from 'lucide-react';
import type { AppRole } from '../../contexts/AuthContext';

interface ProfileCardProps {
  fullName: string;
  email: string;
  role: AppRole | null;
  joinedDate: string;
  onLogout: () => void;
}

const ProfileCard = ({ fullName, email, role, joinedDate, onLogout }: ProfileCardProps) => {
  return (
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
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/50 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:shadow-sm active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
