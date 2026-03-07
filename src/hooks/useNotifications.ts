import { useState, useEffect } from 'react';
import { fetchUpcomingBirthdays, fetchExpiringBonuses, fetchRecentActivity, type ActivityItem } from '../services/dashboardService';
import { logger } from '../lib/logger';
import { useCrmEvent } from './useCrmEvent';
import { CRM_EVENTS } from '../lib/events';

export interface NotificationState {
  upcomingBirthdays: number;
  expiringBonuses: number;
  recentActivity: ActivityItem[];
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationState>({
    upcomingBirthdays: 0,
    expiringBonuses: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [upcomingBirthdays, expiringBonuses, recentActivity] = await Promise.all([
        fetchUpcomingBirthdays(),
        fetchExpiringBonuses(),
        fetchRecentActivity(),
      ]);
      setNotifications({
        upcomingBirthdays,
        expiringBonuses,
        recentActivity,
      });
    } catch (error) {
      logger.error('Error fetching notifications', error, 'useNotifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useCrmEvent(CRM_EVENTS.BONO_REDEEMED, () => fetchNotifications());

  return { notifications, loading, refetch: fetchNotifications };
};
