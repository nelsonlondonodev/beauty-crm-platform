import { Users, Gift, Award, AlertTriangle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { stats, loading } = useDashboardStats();

  const statCards = [
    {
      label: 'Clientes Totales',
      value: loading ? '...' : stats.totalClients.toString(),
      trend: loading ? '' : `+${stats.newClientsThisMonth} este mes`,
      color: 'text-purple-600',
      icon: Users,
    },
    {
      label: 'Bonos Activos',
      value: loading ? '...' : stats.activeBonuses.toString(),
      trend: 'Fidelización',
      color: 'text-green-600',
      icon: Award,
    },
    {
      label: 'Cumpleaños (7 días)',
      value: loading ? '...' : stats.upcomingBirthdays.toString(),
      color: 'text-orange-500',
      icon: Gift,
    },
    {
      label: 'Bonos por Vencer',
      value: loading ? '...' : stats.expiringBonuses.toString(),
      color: 'text-red-500',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Bienvenido de nuevo, Nelson. Aquí está lo que sucede hoy en tu
            negocio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Calendar/Appointment buttons can go here later */}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:h-[400px] lg:grid-cols-7">
        <RevenueChart data={stats.revenueData} />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;
