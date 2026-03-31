import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../contexts/AuthContext';
import { canPerform } from '../lib/rbac';
import {
  DashboardHeader,
  DashboardStatsGrid,
  DashboardRadar,
  RevenueChart,
  RecentActivity
} from '../components/dashboard';

const Dashboard = () => {
  const { user, role } = useAuth();
  const { stats, loading } = useDashboardStats(role);
  const showRevenue = canPerform(role, 'VIEW_REVENUE');

  return (
    <div className="space-y-6">
      <DashboardHeader fullName={user?.user_metadata?.full_name} />
      
      <DashboardStatsGrid stats={stats} loading={loading} />

      {/* Radar de Fidelización (Acciones Rápidas) */}
      {!loading && (
        <DashboardRadar 
          upcomingBirthdays={stats.upcomingBirthdays} 
          expiringBonuses={stats.expiringBonuses} 
        />
      )}

      <div className="grid gap-6 lg:h-[400px] lg:grid-cols-7">
        {showRevenue && (
          <RevenueChart data={stats.revenueData} />
        )}
        <div className={showRevenue ? "col-span-3" : "col-span-7"}>
          <RecentActivity data={stats.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
