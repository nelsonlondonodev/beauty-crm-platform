import { useState, useEffect } from 'react';
import {
  getDashboardStats,
  type DashboardStats,
} from '../services/dashboardService';
import { logger } from '../lib/logger';
import { useCrmEvent } from './useCrmEvent';
import { CRM_EVENTS } from '../lib/events';
import type { AppRole } from '../contexts/AuthContext';

export type { DashboardStats };

export const useDashboardStats = (role: AppRole | null) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    newClientsThisMonth: 0,
    activeBonuses: 0,
    upcomingBirthdays: { count: 0, names: [] },
    expiringBonuses: { count: 0, names: [] },
    revenueData: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Refrescar stats cuando un bono es canjeado desde otro módulo
  useCrmEvent(CRM_EVENTS.BONO_REDEEMED, () => fetchStats());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats(role);
      setStats(data);
    } catch (error) {
      logger.error('Error fetching dashboard stats', error, 'useDashboardStats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
};
