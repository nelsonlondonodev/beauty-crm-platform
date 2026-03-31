import React from 'react';
import { Gift, AlertTriangle } from 'lucide-react';

interface RadarData {
  count: number;
  names: string[];
}

interface DashboardRadarProps {
  upcomingBirthdays: RadarData;
  expiringBonuses: RadarData;
}

const DashboardRadar: React.FC<DashboardRadarProps> = ({ upcomingBirthdays, expiringBonuses }) => {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {/* Próximos Cumpleaños */}
      <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center text-sm font-semibold text-gray-900">
          <Gift className="mr-2 h-4 w-4 text-orange-500" aria-hidden="true" />
          <h3>Próximos Cumpleaños</h3>
        </header>
        <div className="flex flex-wrap gap-2">
          {upcomingBirthdays.names.length > 0 ? (
            upcomingBirthdays.names.map((name, i) => (
              <span key={`${name}-${i}`} className="bg-orange-50 text-orange-700 rounded-full px-3 py-1 text-xs font-medium border border-orange-100">
                {name}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No hay cumpleaños esta semana.</p>
          )}
        </div>
      </article>

      {/* Bonos Críticos */}
      <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center text-sm font-semibold text-gray-900">
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" aria-hidden="true" />
          <h3>Bonos Críticos (Venciendo)</h3>
        </header>
        <div className="flex flex-wrap gap-2">
          {expiringBonuses.names.length > 0 ? (
            expiringBonuses.names.map((name, i) => (
              <span key={`${name}-${i}`} className="bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs font-medium border border-red-100">
                {name}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">Sin bonos urgentes por expirar.</p>
          )}
        </div>
      </article>
    </section>
  );
};

export default DashboardRadar;
