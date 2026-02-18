import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, addDays, addMonths } from 'date-fns';

export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  activeBonuses: number;
  upcomingBirthdays: number;
  expiringBonuses: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    // 1. Total Clients
    const { count: totalClients, error: totalError } = await supabase
      .from('clientes_fidelizacion') // Tabla real
      .select('*', { count: 'exact', head: true });

    if (totalError) throw new Error(`Error fetching total clients: ${totalError.message}`);

    // 2. New Clients This Month
    const start = startOfMonth(new Date()).toISOString();
    const end = endOfMonth(new Date()).toISOString();
    
    const { count: newClients, error: newClientsError } = await supabase
      .from('clientes_fidelizacion')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end);

    if (newClientsError) throw new Error(`Error fetching new clients: ${newClientsError.message}`);

    // 3. Active Bonuses (In DB: canjeado = false)
    const { count: activeBonuses, error: activeBonusesError } = await supabase
      .from('clientes_fidelizacion')
      .select('*', { count: 'exact', head: true })
      .eq('canjeado', false); // "pendiente" equivalent

    if (activeBonusesError) throw new Error(`Error fetching active bonuses: ${activeBonusesError.message}`);

    // 4. Upcoming Birthdays & Expiring Bonuses (Next 7 days)
    const { data: allClients, error: clientsError } = await supabase
      .from('clientes_fidelizacion')
      .select('birthday, created_at, canjeado'); // Usamos birthday y created_at para calcular vencimiento
      
    if (clientsError) throw new Error(`Error fetching clients for dates: ${clientsError.message}`);
    
    let upcomingBirthdaysCount = 0;
    let expiringBonusesCount = 0;

    if (allClients) {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      upcomingBirthdaysCount = allClients.filter(c => {
        if (!c.birthday) return false;
        // Parse date carefully
        const dob = new Date(c.birthday);
        
        // Create date for this year
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      }).length;

      expiringBonusesCount = allClients.filter(c => {
           if (!c.created_at || c.canjeado) return false;
           // Calcular Vencimiento: created_at + 6 meses
           const createdAt = new Date(c.created_at);
           const expiry = addDays(addMonths(createdAt, 6), 0); // Vence a los 6 meses
           
           return expiry >= today && expiry <= nextWeek;
      }).length;
    }

    return {
      totalClients: totalClients || 0,
      newClientsThisMonth: newClients || 0,
      activeBonuses: activeBonuses || 0,
      upcomingBirthdays: upcomingBirthdaysCount,
      expiringBonuses: expiringBonusesCount
    };
};
