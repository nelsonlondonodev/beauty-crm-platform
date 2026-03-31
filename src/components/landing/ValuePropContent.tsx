import { Zap, TrendingUp, Wallet } from 'lucide-react';

const ValuePropContent = () => (
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
);

export default ValuePropContent;
