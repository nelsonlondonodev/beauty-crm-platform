import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Tipos de roles soportados
export type AppRole = 'owner' | 'admin' | 'staff';

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
 * Función utilitaria para evitar que promesas estancadas congelen la UI.
 */
function fetchWithTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

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

    const response = await fetchWithTimeout(request as unknown as Promise<{ data: { role: AppRole } | null; error: any }>, 5000);
    const { data, error } = response;

    if (error || !data) {
      console.warn('Rol no encontrado o error fetching:', error?.message || 'Sin rol');
      return null;
    }
    return data.role as AppRole;
  } catch (err) {
    console.error('Excepción resolviendo rol:', err);
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
      console.error('Error al refrescar usuario:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Obtenemos el usuario real del servidor para asegurar metadata fresca
        const { data: { user: currentUser }, error: userError } = await fetchWithTimeout(supabase.auth.getUser(), 5000);

        if (userError || !currentUser) {
          if (mounted) await clearSession(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentUser && currentSession) {
          const userRole = await fetchRoleFromDB(currentUser.id);
          if (mounted) {
            setSession(currentSession);
            setUser(currentUser);
            setRole(userRole);
            activeUserIdRef.current = currentUser.id;
          }
        }
      } catch (err) {
        console.error('Error al iniciar sesión:', err);
        if (mounted) await clearSession(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        await clearSession(false);
        if (mounted) setLoading(false);
        return;
      }

      if (currentSession?.user) {
        const isSameUser = activeUserIdRef.current === currentSession.user.id;
        
        if (isSameUser) {
          setSession(currentSession);
          // Fusionar metadata: mantener datos frescos del servidor (getUser)
          // y solo agregar campos nuevos desde el token JWT de la sesión.
          // Esto evita que el token (con metadata vieja) sobreescriba
          // campos como avatar_url que ya fueron obtenidos del servidor.
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
        const userRole = await fetchRoleFromDB(currentSession.user.id);

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          setRole(userRole);
          activeUserIdRef.current = currentSession.user.id;
          setLoading(false);
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
      console.error('Error durante el cierre de sesión:', error);
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
