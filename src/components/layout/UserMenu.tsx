import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Shield } from 'lucide-react';
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
  const fullName = user?.user_metadata?.full_name || user?.email || 'Usuario';
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
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 font-bold text-white shadow-md ring-2 ring-white ring-offset-2 ring-offset-gray-100 transition-all hover:scale-105 active:scale-95"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200">
          <div className="border-b border-gray-50 bg-gray-50/50 px-4 py-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fullName}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-purple-600" />
              <p className="text-xs font-semibold tracking-wider text-purple-600 uppercase">
                {role || 'Staff'}
              </p>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-gray-400" />
              Mi Perfil
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              Configuración
            </button>
          </div>

          <div className="border-t border-gray-50 p-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
