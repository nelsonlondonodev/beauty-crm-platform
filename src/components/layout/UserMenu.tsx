import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Obtener iniciales o nombre
  const fullName = user?.user_metadata?.full_name || 'Usuario';
  const email = user?.email || '';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 font-bold text-white shadow-md transition-all hover:shadow-purple-200/50 hover:scale-105 active:scale-95"
      >
        <span className="relative z-10">{initials}</span>
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {isOpen && (
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
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 group"
            >
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                <User className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
              </div>
              <span className="font-medium">Mi Perfil</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
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
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 group"
            >
              <div className="h-8 w-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:bg-white transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

