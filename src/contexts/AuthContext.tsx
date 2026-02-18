import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Lista de correos autorizados
// TODO: En el futuro esto podría venir de una tabla 'admin_users' en la base de datos
const ALLOWED_EMAILS = [
  'nelsonlondonodev@gmail.com',
  'selonel26@gmail.com'
];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para verificar si el usuario está autorizado
  const checkUserAuthorization = async (currentSession: Session | null) => {
    if (currentSession?.user?.email) {
      if (!ALLOWED_EMAILS.includes(currentSession.user.email)) {
        console.warn(`Intento de acceso no autorizado: ${currentSession.user.email}`);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        alert('Acceso denegado. Tu correo no está autorizado para acceder a este sistema.');
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const isAuthorized = await checkUserAuthorization(session);
      if (isAuthorized) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Escuchar cambios en la sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Solo actualizamos el estado si el usuario pasa la verificación o si es null (logout)
      if (!session) {
        setSession(null);
        setUser(null);
        setLoading(false);
      } else {
        const isAuthorized = await checkUserAuthorization(session);
        if (isAuthorized) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else {
            // Si no está autorizado, la función checkUserAuthorization ya hizo el signOut
            // Solo nos aseguramos que el estado local refleje eso
             setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
