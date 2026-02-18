import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';

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
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw new Error(`Error fetching total clients: ${totalError.message}`);

    // 2. New Clients This Month
    const start = startOfMonth(new Date()).toISOString();
    const end = endOfMonth(new Date()).toISOString();
    
    const { count: newClients, error: newClientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end);

    if (newClientsError) throw new Error(`Error fetching new clients: ${newClientsError.message}`);

    // 3. Active Bonuses (Assuming 'pendiente' means active)
    const { count: activeBonuses, error: activeBonusesError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('bono_estado', 'pendiente');

    if (activeBonusesError) throw new Error(`Error fetching active bonuses: ${activeBonusesError.message}`);

    // 4. Upcoming Birthdays & Expiring Bonuses (Next 7 days)
    // Optimization: Fetch only necessary fields, not all columns
    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('fecha_nacimiento, bono_fecha_vencimiento, bono_estado');
      
    if (clientsError) throw new Error(`Error fetching clients for dates: ${clientsError.message}`);
    
    let upcomingBirthdaysCount = 0;
    let expiringBonusesCount = 0;

    if (allClients) {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      upcomingBirthdaysCount = allClients.filter(c => {
        if (!c.fecha_nacimiento) return false;
        // Parse date carefully to handle string format YYYY-MM-DD
        // We need to compare Month and Day regardless of Year
        const [year, month, day] = c.fecha_nacimiento.split('-').map(Number);
        const dob = new Date(year, month - 1, day); 
        
        // Create date for this year
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        // Handle year wrap for end of year birthdays if needed (simplified for next 7 days logic)
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      }).length;

      expiringBonusesCount = allClients.filter(c => {
           if (!c.bono_fecha_vencimiento || c.bono_estado !== 'pendiente') return false;
           // Parse expiry date
           const [year, month, day] = c.bono_fecha_vencimiento.split('-').map(Number);
           const expiry = new Date(year, month - 1, day);
           
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
