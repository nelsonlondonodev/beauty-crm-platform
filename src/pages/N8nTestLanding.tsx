import { useState, useEffect } from 'react';
import { Send, CheckCircle, Sparkles, ShieldCheck, Mail, Phone, User, Calendar, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * N8nTestLanding - Página de Pruebas de Automatización
 * Se asegura de NO SER INDEXADA (Noindex, Nofollow)
 * Conecta con el webhook de n8n para flujos de bienvenida/bonos.
 */
const N8nTestLanding = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cumpleaños: '',
    aceptaPoliticas: false
  });

  // Asegurar no-indexación vía JS (Doble capa de seguridad)
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    return () => { document.head.removeChild(metaRobots); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceptaPoliticas) {
      toast.error('Debes aceptar las políticas de tratamiento de datos.');
      return;
    }

    setLoading(true);
    
    try {
      // Usar la URL que guardamos en .env
      const webhookUrl = import.meta.env.VITE_N8N_TEST_WEBHOOK;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'Landing Pruebas Automatización',
          timestamp: new Date().toISOString(),
          location: 'Colombia (Ley 1581)'
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('¡Datos enviados a n8n correctamente! Bono en camino.');
      } else {
        throw new Error('Error en la respuesta del webhook');
      }
    } catch (error) {
      console.error('N8n Error:', error);
      toast.error('Hubo un error enviando los datos a n8n. Revisa el webhook test.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="animate-in fade-in zoom-in duration-700">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">¡Registro Exitoso!</h1>
          <p className="mt-6 text-xl text-gray-400 max-w-md">
            Los datos han viajado a n8n. Si el flujo es correcto, recibirás tu bono del **15% con código QR** en unos instantes. 🎉
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-10 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20"
          >
            Volver a probar el flujo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-gray-100">
      {/* Background Animated Orbs */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/20 blur-[150px] mix-blend-screen delay-1000 animate-pulse" />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado Izquierdo: Pitch del Bono */}
          <section className="animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 w-fit">
              <Sparkles className="h-3 w-3" />
              <span>Pruebas Internas n8n</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1] sm:text-6xl">
              Prueba el flujo de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic">Bienvenida Real-Time.</span>
            </h1>
            <p className="mt-8 text-lg text-gray-400 font-medium leading-relaxed">
              Al completar este formulario, n8n procesará tu entrada, la guardará en Supabase y generará un bono dinámico del 15% con un QR único de redención. 🚀
            </p>
            
            <div className="mt-12 space-y-4">
               {[
                 { text: 'Conexión Segura vía Webhook', icon: ShieldCheck },
                 { text: 'Generación Dinámica de Código QR', icon: Zap },
                 { text: 'Email Marketing Vía n8n', icon: Mail }
               ].map((item) => (
                 <div key={item.text} className="flex items-center gap-4 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:border-emerald-500/50">
                      <item.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-300">{item.text}</span>
                 </div>
               ))}
            </div>
          </section>

          {/* Lado Derecho: Formulario Wow */}
          <section className="animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <form 
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl"
            >
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-black text-white">¡Únete al Club Narbos!</h2>
                <p className="mt-1 text-sm font-medium text-gray-400 uppercase tracking-tighter">Recibe un 15% de regalo</p>
              </div>

              <div className="space-y-5">
                {/* Nombre */}
                <div className="relative group">
                  <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
                  <input 
                    type="text" required name="nombre" placeholder="Nombre completo"
                    value={formData.nombre} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
                  <input 
                    type="email" required name="email" placeholder="Correo electrónico"
                    value={formData.email} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                  />
                </div>

                {/* Teléfono */}
                <div className="relative group">
                  <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
                  <input 
                    type="tel" required name="telefono" placeholder="WhatsApp (ej: 310123...)"
                    value={formData.telefono} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                  />
                </div>

                {/* Cumpleaños */}
                <div className="relative group">
                  <Calendar className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
                  <input 
                    type="date" required name="cumpleaños"
                    value={formData.cumpleaños} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 [color-scheme:dark]"
                  />
                </div>

                {/* Políticas Ley 1581 */}
                <div className="flex items-start gap-3 px-2 pt-2">
                  <div className="relative flex h-6 items-center">
                    <input 
                      type="checkbox" name="aceptaPoliticas" required
                      checked={formData.aceptaPoliticas} onChange={handleChange}
                      className="h-5 w-5 cursor-pointer rounded-md border-white/10 bg-white/5 text-emerald-500 outline-none ring-offset-slate-900 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="text-xs leading-5 text-gray-400">
                    Acepto que mis datos sean tratados según la **Ley 1581 de 2012** (Colombia) para recibir bonos de bienvenida y comunicaciones comerciales del club.
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="group relative mt-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-500 py-5 text-base font-black text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-emerald-500/50 active:scale-95 disabled:opacity-70 disabled:grayscale transition-transform"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <span>Activar mi Bono 15%</span>
                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
};

export default N8nTestLanding;
