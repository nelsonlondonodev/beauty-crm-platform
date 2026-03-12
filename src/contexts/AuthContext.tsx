import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import type { Session, User, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';

// Tipos de roles soportados
export type AppRole = 'superadmin' | 'owner' | 'admin' | 'staff';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

/**
 * Función pura para obtener el rol desde Supabase.
 */
export const fetchRoleFromDB = async (
  userId: string
): Promise<AppRole | null> => {
  try {
    const request = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const response = await fetchWithTimeout(request as unknown as Promise<{ data: { role: AppRole } | null; error: PostgrestError | null }>, 5000);
    const { data, error } = response;

    if (error || !data) {
      logger.warn('Rol no encontrado o error fetching', error?.message || 'Sin rol', 'Auth');
      return null;
    }
    return data.role as AppRole;
  } catch (err) {
    logger.error('Excepción resolviendo rol', err, 'Auth');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const activeUserIdRef = useRef<string | null>(null);

  // Helper para limpiar totalmente la sesión actual
  const clearSession = useCallback(async (shouldSignOutFromBackend = true) => {
    try {
      if (shouldSignOutFromBackend) {
        await fetchWithTimeout(supabase.auth.signOut(), 3000).catch(() => {});
      }
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      activeUserIdRef.current = null;
    }
  }, []);

  // Helper para refrescar datos del usuario (metadata) desde el servidor
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      logger.error('Error al refrescar usuario', err, 'Auth');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Use a single unified listener for all auth state changes, including the initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        await clearSession(false);
        if (mounted) setLoading(false);
        return;
      }

      if (currentSession?.user) {
        const isSameUser = activeUserIdRef.current === currentSession.user.id;
        
        if (isSameUser) {
          // Fusionar metadata: mantener datos frescos si ya se tenían
          setSession(currentSession);
          setUser(prev => {
            if (!prev) return currentSession.user;
            const mergedMetadata = {
              ...currentSession.user.user_metadata,
              ...prev.user_metadata,
            };
            return { ...currentSession.user, user_metadata: mergedMetadata };
          });
          return;
        }

        setLoading(true);

        try {
          // Fetch fresh user data from server (optional but good for security & metadata)
          const { data: { user: currentUser }, error: userError } = await fetchWithTimeout(supabase.auth.getUser(), 5000);
          const validUser = (!userError && currentUser) ? currentUser : currentSession.user;

          const userRole = await fetchRoleFromDB(validUser.id);

          if (mounted) {
            setSession(currentSession);
            setUser(validUser);
            setRole(userRole);
            activeUserIdRef.current = validUser.id;
          }
        } catch (err) {
          logger.error('Error resolviendo estado de autenticación', err, 'Auth');
        } finally {
          if (mounted) setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearSession]);

  const signOut = async () => {
    try {
      setSession(null);
      setUser(null);
      setRole(null);
      activeUserIdRef.current = null;
      await fetchWithTimeout(supabase.auth.signOut(), 3000);
    } catch (error) {
      logger.error('Error durante el cierre de sesión', error, 'Auth');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
