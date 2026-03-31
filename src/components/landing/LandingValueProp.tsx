import { useState } from 'react';
import { CheckCircle2, TrendingUp, Wallet, Zap } from 'lucide-react';

const LandingValueProp = () => {
  const [ticket, setTicket] = useState(50000);
  const [frecuencia, setFrecuencia] = useState(8);
  const [años, setAños] = useState(2);

  const ltvActual = ticket * frecuencia * años;
  const ltvConLondy = ltvActual * 1.35; // Simulación de +35% de mejora con fidelización
  const gananciaExtra = ltvConLondy - ltvActual;

  return (
    <section id="beneficios" className="relative isolate overflow-hidden bg-slate-950 py-24 sm:py-32">
      {/* Dark Ambient FX */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#4c1d95_0%,transparent_60%)]" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          {/* ── Text Column ── */}
          <article className="animate-in fade-in slide-in-from-left-12 duration-1000">
            <header>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-purple-400">
                Data Driven ROI
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.1]">
                No solo agendas, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">multiplicas el valor.</span>
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-gray-300 font-medium">
                La mayoría de los salones pierden dinero porque no miden el **LTV**. Londy predice qué clientas están a punto de irse y las trae de vuelta automáticamente con bonos inteligentes.
              </p>
            </header>

            <ul className="mt-12 space-y-5">
              {[
                { title: 'Análisis de Redención QR', icon: Zap },
                { title: 'Predicción de Churn Rate', icon: TrendingUp },
                { title: 'Control de Egresos Pro', icon: Wallet }
              ].map((item) => (
                <li key={item.title} className="flex items-center gap-4 text-gray-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <item.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-base font-bold tracking-tight">{item.title}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* ── Calculator Column ── */}
          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl lg:p-12">
              <header className="mb-10 text-center lg:text-left">
                <h3 className="text-2xl font-black text-white">Calculadora de LTV</h3>
                <p className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-widest">Descubre cuánto vale una clienta</p>
              </header>

              <div className="space-y-8">
                {/* Sliders */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                    <span>Gasto por Visita (Ticket)</span>
                    <span className="text-purple-400">${ticket.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="10000" max="250000" step="5000" 
                    value={ticket} onChange={(e) => setTicket(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                    <span>Visitas por Año</span>
                    <span className="text-purple-400">{frecuencia} veces</span>
                  </div>
                  <input 
                    type="range" min="1" max="24" step="1" 
                    value={frecuencia} onChange={(e) => setFrecuencia(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                    <span>Años de Lealtad</span>
                    <span className="text-purple-400">{años} {años === 1 ? 'Año' : 'Años'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={años} onChange={(e) => setAños(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="mt-12 space-y-4 border-t border-white/10 pt-10">
                <div className="flex items-end justify-between">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Valor de Vida (LTV)</p>
                  <p className="text-4xl font-black text-white">${ltvActual.toLocaleString()}</p>
                </div>
                
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                   <div className="flex items-center gap-2 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Impacto Londy (+35%)</p>
                   </div>
                   <p className="mt-2 text-lg font-bold text-emerald-100">
                     Potencial Extra: <span className="text-emerald-400">+${gananciaExtra.toLocaleString()}</span> por cliente.
                   </p>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 -z-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingValueProp;
