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

    // 3. Active Bonuses (In DB: estado = 'Pendiente' on bonos table)
    const { count: activeBonuses, error: activeBonusesError } = await supabase
      .from('bonos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Pendiente');

    if (activeBonusesError) throw new Error(`Error fetching active bonuses: ${activeBonusesError.message}`);

    // 4. Upcoming Birthdays (Next 7 days)
    const { data: allClients, error: clientsError } = await supabase
      .from('clientes_fidelizacion')
      .select('birthday');
      
    if (clientsError) throw new Error(`Error fetching clients for dates: ${clientsError.message}`);

    // 5. Expiring Bonuses (Next 7 days)
    const { data: allBonuses, error: bonusesError } = await supabase
      .from('bonos')
      .select('created_at, fecha_vencimiento')
      .eq('estado', 'Pendiente');

    if (bonusesError) throw new Error(`Error fetching bonuses for dates: ${bonusesError.message}`);
    
    let upcomingBirthdaysCount = 0;
    let expiringBonusesCount = 0;

    const today = new Date();
    // Normalize today to start of day for exact comparison
    today.setHours(0, 0, 0, 0);
    const nextWeek = addDays(today, 7);

    if (allClients) {
      upcomingBirthdaysCount = allClients.filter(c => {
        if (!c.birthday) return false;
        // Parse date carefully
        // Append time to prevent UTC offset shifting the day
        const dob = new Date(`${c.birthday}T12:00:00Z`);
        
        // Create date for this year
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      }).length;
    }
    
    if (allBonuses) {
      expiringBonusesCount = allBonuses.filter(b => {
        if (!b.created_at && !b.fecha_vencimiento) return false;

        let expiry: Date;
        if (b.fecha_vencimiento) {
            expiry = new Date(b.fecha_vencimiento);
        } else {
            // Calcular Vencimiento: created_at + 6 meses
            const createdAt = new Date(b.created_at);
            expiry = addMonths(createdAt, 6); // Vence a los 6 meses
        }
        
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
