import type { AdminStat } from './types';

interface AdminStatsProps {
  stats: AdminStat[];
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`rounded-lg ${stat.bg} p-2`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
