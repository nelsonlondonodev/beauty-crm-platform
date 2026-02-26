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

  // Función auxiliar para verificar si el usuario tiene rol y obtenerlo
  const checkUserAuthorization = async (
    currentSession: Session | null
  ): Promise<AppRole | null> => {
    if (!currentSession?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentSession.user.id)
        .single();

      if (error || !data) {
        console.warn(
          `Intento de acceso sin rol válido o con error: `,
          error?.message
        );
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        // Usamos setTimeout para no bloquear el hilo o fallar si se llama múltiples veces
        setTimeout(() => {
          console.error(
            'Acceso denegado: Usuario sin rol en la base de datos.'
          );
        }, 100);
        return null;
      }

      return data.role as AppRole;
    } catch (err) {
      console.error('Error catastrófico en la revisión de roles:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Establecemos un "seguro" de tiempo. Si Supabase tarda más de 5 segundos,
    // forzamos el fin de la carga para no dejar al usuario varado.
    const failsafeTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout: Forzando pantalla de carga a falso.');
        setLoading(false);
      }
    }, 5000);

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const userRole = await checkUserAuthorization(session);
          if (mounted && userRole) {
            setSession(session);
            setUser(session.user);
            setRole(userRole);
          }
        }
      } catch (e) {
        console.error('Initial session fetch error:', e);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'INITIAL_SESSION') return;

      if (currentSession) {
        const userRole = await checkUserAuthorization(currentSession);
        if (mounted && userRole) {
          setSession(currentSession);
          setUser(currentSession.user);
          setRole(userRole);
        }
      } else {
        if (mounted) {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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
