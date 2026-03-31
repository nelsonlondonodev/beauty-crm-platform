interface ProfileKPIsProps {
  totalSpent: number;
  totalVisits: number;
}

const ProfileKPIs = ({ totalSpent, totalVisits }: ProfileKPIsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <article className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
        <h2 className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Consumo Total (LTV)
        </h2>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${totalSpent.toLocaleString()}</span>
          <span className="text-xs text-gray-400">USD</span>
        </div>
      </article>
      <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Frecuencia de Visita
        </h2>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{totalVisits}</span>
          <span className="text-xs text-gray-500">visitas</span>
        </div>
      </article>
    </div>
  );
};

export default ProfileKPIs;
