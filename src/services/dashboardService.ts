import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, addDays, addMonths } from 'date-fns';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';

export interface RevenueData {
  name: string;
  ingresos: number;
}

export interface ActivityItem {
  id: string;
  type: 'appointment' | 'client' | 'sale' | 'bonus';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  activeBonuses: number;
  upcomingBirthdays: number;
  expiringBonuses: number;
  revenueData: RevenueData[];
  recentActivity: ActivityItem[];
}

async function fetchTotalClients(): Promise<number> {
  const { count, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .select('*', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );
  if (error) throw new Error(`Error fetching total clients: ${error.message}`);
  return count || 0;
}

async function fetchNewClientsThisMonth(): Promise<number> {
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { count, error } = await fetchWithTimeout(
    supabase
      .from('clientes_fidelizacion')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end) as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );

  if (error) throw new Error(`Error fetching new clients: ${error.message}`);
  return count || 0;
}

async function fetchActiveBonuses(): Promise<number> {
  const { count, error } = await fetchWithTimeout(
    supabase
      .from('bonos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Pendiente') as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );

  if (error) throw new Error(`Error fetching active bonuses: ${error.message}`);
  return count || 0;
}

async function fetchUpcomingBirthdays(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  const formatMMDD = (d: Date) => d.toISOString().slice(5, 10);
  const todayMMDD = formatMMDD(today);
  const nextWeekMMDD = formatMMDD(nextWeek);

  try {
    if (nextWeekMMDD < todayMMDD) {
      const { data } = await fetchWithTimeout(
        supabase
          .from('clientes_fidelizacion')
          .select('birthday')
          .not('birthday', 'is', null)
          .or(`birthday.ilike.%-${todayMMDD},birthday.ilike.%-${nextWeekMMDD}`) as unknown as Promise<{ data: { birthday: string | null }[] | null }>
      );
      return data?.length || 0;
    } else {
      const { data } = await fetchWithTimeout(
        supabase
          .from('clientes_fidelizacion')
          .select('birthday')
          .not('birthday', 'is', null) as unknown as Promise<{ data: { birthday: string | null }[] | null }>
      );

      if (data) {
        return data.filter((c: { birthday: string | null }) => {
          if (!c.birthday) return false;
          const dob = new Date(`${c.birthday}T12:00:00Z`);
          const thisYearBirthday = new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
          );
          return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
        }).length;
      }
    }
  } catch (err) {
    logger.error('Error fetching birthdays', err, 'Dashboard');
  }
  return 0;
}

async function fetchExpiringBonuses(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  try {
    const { count } = await fetchWithTimeout(
      supabase
        .from('bonos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Pendiente')
        .gte('fecha_vencimiento', today.toISOString())
        .lte('fecha_vencimiento', nextWeek.toISOString()) as unknown as Promise<{ count: number | null; error: PostgrestError | null }>,
      3000
    );
    return count || 0;
  } catch (err) {
    logger.error('Error fetching expiring bonuses', err, 'Dashboard');
    return 0;
  }
}

interface RevenueBucket extends RevenueData {
  _month: number;
  _year: number;
}

async function fetchRevenueData(): Promise<RevenueData[]> {
  const today = new Date();
  const sixMonthsAgo = startOfMonth(addMonths(today, -6));
  const { data: facturas, error } = await supabase
    .from('facturas')
    .select('fecha_venta, total')
    .gte('fecha_venta', sixMonthsAgo.toISOString());

  let revenueData: RevenueBucket[] = [];

  if (error) {
    logger.error('Error fetching revenue data', error.message, 'Dashboard');
    return [];
  }

  if (facturas) {
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    for (let i = 6; i >= 0; i--) {
      const targetDate = addMonths(today, -i);
      revenueData.push({
        name: monthNames[targetDate.getMonth()],
        ingresos: 0,
        _month: targetDate.getMonth(),
        _year: targetDate.getFullYear()
      });
    }

    facturas.forEach((factura) => {
      if (!factura.fecha_venta) return;
      const fDate = new Date(factura.fecha_venta);
      const fMonth = fDate.getMonth();
      const fYear = fDate.getFullYear();

      const bucket = revenueData.find(
        (b) => b._month === fMonth && b._year === fYear
      );
      if (bucket) {
        bucket.ingresos += Number(factura.total) || 0;
      }
    });

    return revenueData.map((b) => ({
      name: b.name,
      ingresos: b.ingresos,
    }));
  }

  return [];
}

async function fetchRecentActivity(): Promise<ActivityItem[]> {
  let recentActivity: ActivityItem[] = [];

  try {
    const [appointmentsRes, clientsRes, ventasRes, bonosRes] = await Promise.all([
      supabase
        .from('appointments')
        .select(`
          id, 
          created_at, 
          servicio, 
          client:clientes_fidelizacion(nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('clientes_fidelizacion')
        .select('id, created_at, nombre')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('facturas')
        .select('id, fecha_venta')
        .order('fecha_venta', { ascending: false })
        .limit(5),
      supabase
        .from('bonos')
        .select(`
          id, 
          fecha_canje, 
          tipo, 
          client:clientes_fidelizacion(nombre)
        `)
        .not('fecha_canje', 'is', null)
        .order('fecha_canje', { ascending: false })
        .limit(5),
    ]);

    if (appointmentsRes.data) {
      type AppointmentWithClient = {
        id: string;
        created_at: string;
        servicio: string;
        client: { nombre: string } | { nombre: string }[] | null;
      };

      (appointmentsRes.data as unknown as AppointmentWithClient[]).forEach((a) => {
        let nombre = 'Cliente desconocido';
        if (a.client) {
          if (Array.isArray(a.client)) {
            nombre = a.client[0]?.nombre || nombre;
          } else {
            nombre = a.client.nombre || nombre;
          }
        }
        recentActivity.push({
          id: `app-${a.id}`,
          type: 'appointment',
          title: 'Nueva Cita Programada',
          description: `${nombre.trim()} reservó para ${a.servicio}`,
          timestamp: a.created_at,
        });
      });
    }

    if (clientsRes.data) {
      type ClientRow = { id: number; created_at: string; nombre: string | null };

      (clientsRes.data as unknown as ClientRow[]).forEach((c) => {
        recentActivity.push({
          id: `cli-${c.id}`,
          type: 'client',
          title: 'Nuevo Cliente',
          description: `${(c.nombre || '').trim()} se unió al programa`,
          timestamp: c.created_at,
        });
      });
    }

    if (ventasRes.data) {
      ventasRes.data.forEach((v) => {
        recentActivity.push({
          id: `ven-${v.id}`,
          type: 'sale',
          title: 'Venta Procesada',
          description: `Nueva factura generada en el sistema`,
          timestamp: v.fecha_venta || new Date().toISOString(),
        });
      });
    }

    if (bonosRes.data) {
      type BonoWithClient = {
        id: string;
        fecha_canje: string | null;
        tipo: string;
        client: { nombre: string } | { nombre: string }[] | null;
      };

      (bonosRes.data as unknown as BonoWithClient[]).forEach((b) => {
        let nombre = 'Cliente desconocido';
        if (b.client) {
          if (Array.isArray(b.client)) {
            nombre = b.client[0]?.nombre || nombre;
          } else {
            nombre = b.client.nombre || nombre;
          }
        }
        recentActivity.push({
          id: `bon-${b.id}`,
          type: 'bonus',
          title: 'Bono Canjeado',
          description: `${nombre.trim()} canjeó su bono de ${b.tipo}`,
          timestamp: b.fecha_canje || new Date().toISOString(),
        });
      });
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    recentActivity = recentActivity.slice(0, 10);
  } catch (err) {
    logger.error('Error fetching recent activity', err, 'Dashboard');
  }

  return recentActivity;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Ejecutamos las promesas de forma concurrente, lo que además de limpiar
  // el código monolítico, aumenta enormemente la velocidad de carga de la página.
  const [
    totalClients,
    newClientsThisMonth,
    activeBonuses,
    upcomingBirthdays,
    expiringBonuses,
    revenueData,
    recentActivity
  ] = await Promise.all([
    fetchTotalClients(),
    fetchNewClientsThisMonth(),
    fetchActiveBonuses(),
    fetchUpcomingBirthdays(),
    fetchExpiringBonuses(),
    fetchRevenueData(),
    fetchRecentActivity()
  ]);

  return {
    totalClients,
    newClientsThisMonth,
    activeBonuses,
    upcomingBirthdays,
    expiringBonuses,
    revenueData,
    recentActivity,
  };
};
