import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
 * Función pura para obtener el rol desde Supabase. Sólo hace de "getter".
 * Se define fuera del componente para evitar ser recreada en cada render,
 * mejorando el rendimiento y siguiendo las mejores prácticas (SOLID).
 */
const fetchRoleFromDB = async (userId: string): Promise<AppRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('Rol no encontrado o error local fetching:', error?.message);
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

  // Usamos un Ref inmutable en vez de variables locales que sucumben a closures obsoletos
  const activeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Al arrancar, verificamos el estado de manera síncrona/directa
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && session.user) {
          const userRole = await fetchRoleFromDB(session.user.id);
          if (mounted) {
            if (userRole) {
              setSession(session);
              setUser(session.user);
              setRole(userRole);
              activeUserIdRef.current = session.user.id;
            } else {
              // Si falla gravemente el rol, destrozamos por seguridad la sesión inválida
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setRole(null);
              activeUserIdRef.current = null;
            }
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setRole(null);
            activeUserIdRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error crítico al iniciar sesión de app:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Lanzamos carga inicial INMEDIATA sin flags trampa
    initializeAuth();

    // Reacción pasiva a eventos directos del SDK (Logins, relogins, logouts)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      // ignoramos INITIAL_SESSION para evitar sobre-escrituras o triggers redundantes en local
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null);
        setUser(null);
        setRole(null);
        activeUserIdRef.current = null;
        setLoading(false);
        return;
      }

      // Si es una sincronización en vivo o un login pasivo:
      if (currentSession?.user) {
        // ¿Ya lo teníamos cargado en la misma sesión? Entonces es un simple refresh del token de fondo.
        // No bloqueamos la UI con setLoading(true). Actualizamos sesión invisiblemente.
        if (activeUserIdRef.current === currentSession.user.id) {
          setSession(currentSession);
          return;
        }

        // ES genuinamente una cuenta distinta intentando entrar a la vista. Aquí SI bloqueamos
        setLoading(true); // Pantalla bloqueada temporal
        const userRole = await fetchRoleFromDB(currentSession.user.id);

        if (mounted) {
          if (userRole) {
            setSession(currentSession);
            setUser(currentSession.user);
            setRole(userRole);
            activeUserIdRef.current = currentSession.user.id;
          } else {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setRole(null);
            activeUserIdRef.current = null;
          }
          setLoading(false); // Liberar Interfaz
        }
      }
    });

    // Cleanup para Strict Mode de React (destruimos el scope si es necesario)
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependencias vacías []. Nunca usar flags locales.

  const signOut = async () => {
    try {
      // 1. Limpiamos estado local de inmediato para que la UI reaccione más rápido
      setSession(null);
      setUser(null);
      setRole(null);

      // 2. Cerramos la sesión en el backend
      await supabase.auth.signOut();
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
