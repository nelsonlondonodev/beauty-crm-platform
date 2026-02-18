import { useState, useEffect } from 'react';
import { getDashboardStats, type DashboardStats } from '../services/dashboardService';

export type { DashboardStats };

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    newClientsThisMonth: 0,
    activeBonuses: 0,
    upcomingBirthdays: 0,
    expiringBonuses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
};
