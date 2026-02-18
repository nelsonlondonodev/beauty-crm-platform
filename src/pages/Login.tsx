import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Scissors, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

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
      // La navegación ocurre automáticamente por el useEffect cuando la sesión cambia
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Por favor verifica tu correo y contraseña.' 
        : err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/40">
        
        {/* Header */}
        <div className="flex flex-col items-center bg-white/30 p-8 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-400 text-white shadow-lg shadow-primary/30 mb-4">
            <Scissors size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Beauty CRM</h2>
          <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <div className="p-8 pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] group"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Ingresar</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50/50 p-4 text-center border-t border-white/40">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Beauty CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
