import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import ValuePropContent from './ValuePropContent';
import LTVSlider from './LTVSlider';

const LandingValueProp = () => {
  const [ticket, setTicket] = useState(50000);
  const [frecuencia, setFrecuencia] = useState(8);
  const [años, setAños] = useState(2);

  const ltvActual = ticket * frecuencia * años;
  const ltvConLondy = ltvActual * 1.35;
  const gananciaExtra = ltvConLondy - ltvActual;

  return (
    <section id="beneficios" className="relative isolate overflow-hidden bg-slate-950 py-16 sm:py-24">
      {/* Dark Ambient FX */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#4c1d95_0%,transparent_60%)]" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          <ValuePropContent />

          {/* ── Calculator Column ── */}
          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl lg:p-12">
              <header className="mb-10 text-center lg:text-left">
                <h3 className="text-2xl font-black text-white">Calculadora de LTV</h3>
                <p className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-widest">Descubre cuánto vale una clienta</p>
              </header>

              <div className="space-y-8">
                <LTVSlider 
                  label="Gasto por Visita (Ticket)" 
                  value={ticket} min={10000} max={250000} step={5000} 
                  displayValue={`$${ticket.toLocaleString()}`}
                  onChange={setTicket}
                />
                <LTVSlider 
                  label="Visitas por Año" 
                  value={frecuencia} min={1} max={24} step={1} 
                  displayValue={`${frecuencia} veces`}
                  onChange={setFrecuencia}
                />
                <LTVSlider 
                  label="Años de Lealtad" 
                  value={años} min={1} max={10} step={1} 
                  displayValue={`${años} ${años === 1 ? 'Año' : 'Años'}`}
                  onChange={setAños}
                />
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

            <div className="absolute -bottom-6 -right-6 -z-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingValueProp;
