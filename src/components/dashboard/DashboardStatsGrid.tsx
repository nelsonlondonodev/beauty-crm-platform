import { Users, Gift, Award, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard';
import type { DashboardStats } from '../../hooks/useDashboardStats';

interface DashboardStatsGridProps {
  stats: DashboardStats;
  loading: boolean;
}

const DashboardStatsGrid = ({ stats, loading }: DashboardStatsGridProps) => {
  const cards = [
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
      value: loading ? '...' : stats.upcomingBirthdays.count.toString(),
      color: 'text-orange-500',
      icon: Gift,
    },
    {
      label: 'Bonos por Vencer',
      value: loading ? '...' : stats.expiringBonuses.count.toString(),
      color: 'text-red-500',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStatsGrid;
