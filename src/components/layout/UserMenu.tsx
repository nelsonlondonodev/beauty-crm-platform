import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl, getInitials } from '../../lib/avatar';
import UserMenuTrigger from './UserMenu/UserMenuTrigger';
import UserMenuDropdown from './UserMenu/UserMenuDropdown';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

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

  const fullName = user?.user_metadata?.full_name || 'Usuario';
  const email = user?.email || '';
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(fullName);

  return (
    <div className="relative" ref={menuRef}>
      <UserMenuTrigger 
        initials={initials} 
        avatarUrl={avatarUrl}
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
      />

      {isOpen && (
        <UserMenuDropdown
          fullName={fullName}
          email={email}
          role={role}
          avatarUrl={avatarUrl}
          initials={initials}
          onNavigate={(path) => {
            setIsOpen(false);
            navigate(path);
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default UserMenu;


