import { useState, useEffect } from 'react';
import { Send, User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AutomationBackground from '../components/n8n/AutomationBackground';
import AutomationHeader from '../components/n8n/AutomationHeader';
import AutomationSuccess from '../components/n8n/AutomationSuccess';

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
      const webhookUrl = import.meta.env.VITE_N8N_TEST_WEBHOOK;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'Landing Pruebas', timestamp: new Date().toISOString() }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Envío a n8n exitoso.');
      } else {
        throw new Error('Webhook error');
      }
    } catch (error) {
      toast.error('Error de conexión con n8n.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (success) return <AutomationSuccess onRetry={() => setSuccess(false)} />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-gray-100">
      <AutomationBackground />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <AutomationHeader />

          {/* Form Side - Still logic-heavy but cleaner */}
          <section className="animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-black text-white">¡Únete al Club Narbos!</h2>
                <p className="mt-1 text-sm font-medium text-gray-400 uppercase tracking-tighter">Recibe un 15% de regalo</p>
              </div>

              <div className="space-y-5">
                {[
                  { name: 'nombre', icon: User, type: 'text', placeholder: 'Nombre completo' },
                  { name: 'email', icon: Mail, type: 'email', placeholder: 'Correo electrónico' },
                  { name: 'telefono', icon: Phone, type: 'tel', placeholder: 'WhatsApp' }
                ].map((input) => (
                  <div key={input.name} className="relative group">
                    <input.icon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400" />
                    <input 
                      type={input.type} name={input.name} required placeholder={input.placeholder}
                      value={(formData as any)[input.name]} onChange={handleChange}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
                    />
                  </div>
                ))}

                <div className="relative group">
                  <Calendar className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400" />
                  <input 
                    type="date" name="cumpleaños" required value={formData.cumpleaños} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-purple-500/50 focus:bg-white/10 [color-scheme:dark]"
                  />
                </div>

                <div className="flex items-start gap-3 px-2 pt-2 text-xs leading-5 text-gray-400">
                  <input 
                    type="checkbox" name="aceptaPoliticas" checked={formData.aceptaPoliticas} onChange={handleChange}
                    className="h-5 w-5 cursor-pointer rounded-md border-white/10 bg-white/5 text-purple-500 outline-none focus:ring-purple-500"
                  />
                  <span>Acepto que mis datos sean tratados según la **Ley 1581 de 2012** (Colombia).</span>
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="group relative mt-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-5 text-base font-black text-white shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] hover:shadow-purple-500/50"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>Activar mi Bono 15%</span>}
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
};

export default N8nTestLanding;
