import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Scissors, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
import GoogleIcon from '../components/icons/GoogleIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      const err = error as Error;
      setError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Por favor verifica tu correo y contraseña.'
          : err.message || 'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      const err = error as Error;
      setError(err.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col items-center bg-white/30 p-8 pb-6">
          <div className="from-primary shadow-primary/30 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr to-purple-400 text-white shadow-lg">
            <Scissors size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Londy</h2>
          <p className="mt-1 text-gray-500">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <div className="p-8 pt-2">
          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="focus:ring-primary/20 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continuar con Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/50 px-2 text-gray-400 backdrop-blur-xl">
                  O con correo
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="ml-1 text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <div className="group relative">
                  <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:border-primary focus:ring-primary/20 block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pr-3 pl-10 text-gray-900 placeholder-gray-400 transition-all outline-none focus:bg-white focus:ring-2"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="group relative">
                  <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:border-primary focus:ring-primary/20 block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pr-3 pl-10 text-gray-900 placeholder-gray-400 transition-all outline-none focus:bg-white focus:ring-2"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 focus:ring-primary/20 group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all focus:ring-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar con Correo</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/40 bg-gray-50/50 p-4 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Londy. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
