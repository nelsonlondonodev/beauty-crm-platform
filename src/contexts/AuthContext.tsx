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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

/**
 * Función utilitaria para evitar que promesas estancadas (ej. bugs recursivos de RLS) congelen la UI.
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
 * Usa fetchWithTimeout para prevenir que un fallo de RLS bloquee la app infinitamente.
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
      console.warn(
        'Rol no encontrado o error local fetching:',
        error?.message || 'Usuario sin rol asignado'
      );
      return null;
    }
    return data.role as AppRole;
  } catch (err) {
    if (err instanceof Error && err.message === 'REQUEST_TIMEOUT') {
      console.error(
        'CRÍTICO: Fetching de rol excedió el tiempo límite (5s). Revisa las políticas RLS en Supabase en `user_roles` por bucles infinitos.'
      );
    } else {
      console.error('Excepción resolviendo rol:', err);
    }
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Usamos un Ref inmutable en vez de variables locales que sucumben a closures obsoletos
  const activeUserIdRef = useRef<string | null>(null);

  // Helper para asignar la sesión exitosa
  const assignSession = useCallback(
    (newSession: Session, userRole: AppRole) => {
      setSession(newSession);
      setUser(newSession.user);
      setRole(userRole);
      activeUserIdRef.current = newSession.user.id;
    },
    []
  );

  // Helper para limpiar totalmente la sesión actual si es inválida
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await fetchWithTimeout(supabase.auth.getSession(), 5000);

        if (error) throw error;

        if (initialSession?.user) {
          const userRole = await fetchRoleFromDB(initialSession.user.id);
          if (mounted) {
            if (userRole) {
              assignSession(initialSession, userRole);
            } else {
              await clearSession();
            }
          }
        } else {
          if (mounted) {
            await clearSession(false);
          }
        }
      } catch (err) {
        console.error('Error crítico al iniciar sesión de app:', err);
        if (mounted) await clearSession(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Lanzamos carga inicial
    initializeAuth();

    // Reacción pasiva a eventos directos del SDK
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        await clearSession(false);
        if (mounted) setLoading(false);
        return;
      }

      if (currentSession?.user) {
        // ¿Ya lo teníamos cargado en la misma sesión? Token refresh de fondo.
        if (activeUserIdRef.current === currentSession.user.id) {
          setSession(currentSession);
          return;
        }

        // Cuenta distinta intentando entrar a la vista. Aquí SI bloqueamos
        setLoading(true);
        const userRole = await fetchRoleFromDB(currentSession.user.id);

        if (mounted) {
          if (userRole) {
            assignSession(currentSession, userRole);
          } else {
            await clearSession();
          }
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [assignSession, clearSession]);

  const signOut = async () => {
    try {
      // 1. Limpiamos estado local de inmediato
      setSession(null);
      setUser(null);
      setRole(null);
      activeUserIdRef.current = null;

      // 2. Cerramos la sesión en el backend sin congelar App
      await fetchWithTimeout(supabase.auth.signOut(), 3000);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
