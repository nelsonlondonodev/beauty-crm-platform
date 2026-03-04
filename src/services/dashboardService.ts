import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, addDays, addMonths } from 'date-fns';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';

// --- Interfaces ---

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

// Interfaces internas para el tipado de Supabase
interface AppointmentWithClient {
  id: string;
  created_at: string;
  servicio: string;
  client: { nombre: string } | { nombre: string }[] | null;
}

interface ClientRow {
  id: number;
  created_at: string;
  nombre: string | null;
}

interface FacturaRow {
  id: string;
  fecha_venta: string | null;
}

interface BonoWithClient {
  id: string;
  fecha_canje: string | null;
  tipo: string;
  client: { nombre: string } | { nombre: string }[] | null;
}

// --- Funciones de obtención de estadísticas básicas ---

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
  const upcomingDaysMMDD = new Set(Array.from({ length: 8 }).map((_, i) => {
    const d = addDays(today, i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }));

  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .select('birthday')
        .not('birthday', 'is', null) as unknown as Promise<{ data: { birthday: string | null }[] | null, error: PostgrestError | null }>
    );

    if (error) throw new Error(error.message);
    if (!data) return 0;
    
    return data.filter(client => {
      if (!client.birthday) return false;
      const mmdd = client.birthday.substring(5, 10);
      return upcomingDaysMMDD.has(mmdd);
    }).length;
    
  } catch (err) {
    logger.error('Error fetching birthdays', err, 'Dashboard');
    return 0;
  }
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

// --- Funciones de Ingresos ---

async function fetchRevenueData(): Promise<RevenueData[]> {
  const today = new Date();
  const sixMonthsAgo = startOfMonth(addMonths(today, -6));
  const { data: facturas, error } = await supabase
    .from('facturas')
    .select('fecha_venta, total')
    .gte('fecha_venta', sixMonthsAgo.toISOString());

  if (error) {
    logger.error('Error fetching revenue data', error.message, 'Dashboard');
    return [];
  }

  if (!facturas) return [];

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const revenueMap = new Map<string, number>();

  // Inicializar los últimos 7 meses
  for (let i = 6; i >= 0; i--) {
    const targetDate = addMonths(today, -i);
    const key = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    revenueMap.set(key, 0);
  }

  facturas.forEach((factura) => {
    if (!factura.fecha_venta) return;
    const fDate = new Date(factura.fecha_venta);
    const key = `${fDate.getFullYear()}-${fDate.getMonth()}`;
    
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) || 0) + (Number(factura.total) || 0));
    }
  });

  return Array.from(revenueMap.entries()).map(([key, total]) => {
    const [, month] = key.split('-');
    return {
      name: monthNames[parseInt(month)],
      ingresos: total
    };
  });
}

// --- Funciones Atómicas de Actividad ---

async function fetchRecentAppointments(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, created_at, servicio, client:clientes_fidelizacion(nombre)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return (data as unknown as AppointmentWithClient[]).map(a => {
    const nombre = Array.isArray(a.client) ? a.client[0]?.nombre : a.client?.nombre;
    return {
      id: `app-${a.id}`,
      type: 'appointment',
      title: 'Nueva Cita Programada',
      description: `${(nombre || 'Cliente desconocido').trim()} reservó para ${a.servicio}`,
      timestamp: a.created_at,
    };
  });
}

async function fetchRecentClients(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('clientes_fidelizacion')
    .select('id, created_at, nombre')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return (data as unknown as ClientRow[]).map(c => ({
    id: `cli-${c.id}`,
    type: 'client',
    title: 'Nuevo Cliente',
    description: `${(c.nombre || '').trim()} se unió al programa`,
    timestamp: c.created_at,
  }));
}

async function fetchRecentSales(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('facturas')
    .select('id, fecha_venta')
    .order('fecha_venta', { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return (data as unknown as FacturaRow[]).map(v => ({
    id: `ven-${v.id}`,
    type: 'sale',
    title: 'Venta Procesada',
    description: `Nueva factura generada en el sistema`,
    timestamp: v.fecha_venta || new Date().toISOString(),
  }));
}

async function fetchRecentBonuses(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('bonos')
    .select('id, fecha_canje, tipo, client:clientes_fidelizacion(nombre)')
    .not('fecha_canje', 'is', null)
    .order('fecha_canje', { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return (data as unknown as BonoWithClient[]).map(b => {
    const nombre = Array.isArray(b.client) ? b.client[0]?.nombre : b.client?.nombre;
    return {
      id: `bon-${b.id}`,
      type: 'bonus',
      title: 'Bono Canjeado',
      description: `${(nombre || 'Cliente desconocido').trim()} canjeó su bono de ${b.tipo}`,
      timestamp: b.fecha_canje || new Date().toISOString(),
    };
  });
}

async function fetchRecentActivity(): Promise<ActivityItem[]> {
  try {
    const results = await Promise.all([
      fetchRecentAppointments(),
      fetchRecentClients(),
      fetchRecentSales(),
      fetchRecentBonuses()
    ]);

    return results
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  } catch (err) {
    logger.error('Error fetching recent activity', err, 'Dashboard');
    return [];
  }
}

// --- Función Principal ---

export const getDashboardStats = async (): Promise<DashboardStats> => {
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
