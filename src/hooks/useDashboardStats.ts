import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';

export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  activeBonuses: number;
  upcomingBirthdays: number;
  expiringBonuses: number;
}

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

      // 1. Total Clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // 2. New Clients This Month
      const start = startOfMonth(new Date()).toISOString();
      const end = endOfMonth(new Date()).toISOString();
      
      const { count: newClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start)
        .lte('created_at', end);

      // 3. Active Bonuses (Assuming 'pendiente' means active)
      const { count: activeBonuses } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('bono_estado', 'pendiente');

      // 4. Upcoming Birthdays (Next 7 days - simplified logic)
      // Note: Actual implementation for birthdays across years is complex in SQL/Supabase without functions.
      // For MVP, we might fetch all clients and filter in JS if the list is small, or just show a count placeholder.
      // Let's do a JS filter for now assuming small DB.
      const { data: allClients } = await supabase.from('clients').select('fecha_nacimiento, bono_fecha_vencimiento, bono_estado');
      
      let upcomingBirthdaysCount = 0;
      let expiringBonusesCount = 0;

      if (allClients) {
        const today = new Date();
        const nextWeek = addDays(today, 7);

        upcomingBirthdaysCount = allClients.filter(c => {
          if (!c.fecha_nacimiento) return false;
          const dob = new Date(c.fecha_nacimiento);
          const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
        }).length;

        expiringBonusesCount = allClients.filter(c => {
             if (!c.bono_fecha_vencimiento || c.bono_estado !== 'pendiente') return false;
             const expiry = new Date(c.bono_fecha_vencimiento);
             return expiry >= today && expiry <= nextWeek;
        }).length;
      }

      setStats({
        totalClients: totalClients || 0,
        newClientsThisMonth: newClients || 0,
        activeBonuses: activeBonuses || 0,
        upcomingBirthdays: upcomingBirthdaysCount,
        expiringBonuses: expiringBonusesCount
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
};
