import React, { createContext, useContext, useEffect, useState } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // Para no saltar de golpe al login en el primer render

  // Función auxiliar para verificar si el usuario tiene rol y obtenerlo con reintentos
  const checkUserAuthorization = async (
    currentSession: Session | null,
    retryCount = 0
  ): Promise<AppRole | null> => {
    if (!currentSession?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        console.warn(
          `Error obteniendo rol (Intento ${retryCount + 1}):`,
          error.message
        );
        // Si hay error de red o timeout, intentamos hasta 3 veces
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return checkUserAuthorization(currentSession, retryCount + 1);
        }
        // Tras los intentos, cerramos sesión por seguridad para no dejar un estado colgado
        await supabase.auth.signOut();
        return null;
      }

      if (!data) {
        console.error('Acceso denegado: Usuario sin rol en la base de datos.');
        // Si NO hay registro definitivamente, cerramos la sesión del usuario
        await supabase.auth.signOut();
        return null;
      }

      return data.role as AppRole;
    } catch (err) {
      console.error('Excepción al revisar roles:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          const userRole = await checkUserAuthorization(session);
          if (mounted) {
            if (userRole) {
              setSession(session);
              setUser(session.user);
              setRole(userRole);
            } else {
              setSession(null);
              setUser(null);
              setRole(null);
            }
          }
        }
      } catch (e) {
        console.error('Initial session fetch error:', e);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    if (!initialized) {
      init();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'INITIAL_SESSION') return;

      if (currentSession) {
        // En cada cambio de sesión o recarga forzada por Auth
        setLoading(true);
        const userRole = await checkUserAuthorization(currentSession);
        if (mounted) {
          if (userRole) {
            setSession(currentSession);
            setUser(currentSession.user);
            setRole(userRole);
          } else {
            setSession(null);
            setUser(null);
            setRole(null);
          }
          setLoading(false);
        }
      } else {
        if (mounted) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signOut = async () => {
    try {
      // 1. Limpiamos estado local de inmedidato para que la UI reaccione más rápido
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
