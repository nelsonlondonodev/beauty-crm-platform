import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, addMonths, addDays } from 'date-fns';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';
import { isBirthdayInRange } from '../lib/dateUtils';
import { canPerform } from '../lib/rbac';
import type { AppRole } from '../contexts/AuthContext';

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
  upcomingBirthdays: {
    count: number;
    names: string[];
  };
  expiringBonuses: {
    count: number;
    names: string[];
  };
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

// --- Funciones Atómicas de Métricas ---
type StatsQuery = ReturnType<typeof supabase.from> extends { select: infer S } 
  ? S extends (...args: never[]) => infer R ? R : never 
  : never;

async function fetchStatsHead(
  table: string, 
  filter?: (query: StatsQuery) => StatsQuery
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) query = filter(query as unknown as StatsQuery) as typeof query;
  
  const { count, error } = await fetchWithTimeout(
    query as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );
  if (error) {
    logger.error(`Error fetching stats for ${table}`, error.message, 'Dashboard');
    return 0;
  }
  return count || 0;
}

async function fetchTotalClients(): Promise<number> {
  return fetchStatsHead('clientes_fidelizacion');
}

async function fetchNewClientsThisMonth(): Promise<number> {
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();
  return fetchStatsHead('clientes_fidelizacion', q => q.gte('created_at', start).lte('created_at', end));
}

async function fetchActiveBonuses(): Promise<number> {
  return fetchStatsHead('bonos', q => q.eq('estado', 'Pendiente'));
}

export async function fetchUpcomingBirthdays(): Promise<{ count: number; names: string[] }> {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('clientes_fidelizacion')
        .select('nombre, birthday')
        .not('birthday', 'is', null) as unknown as Promise<{ data: { nombre: string; birthday: string | null }[] | null, error: PostgrestError | null }>
    );

    if (error || !data) return { count: 0, names: [] };
    
    const upcoming = data.filter(client => isBirthdayInRange(client.birthday));
    return {
      count: upcoming.length,
      names: upcoming.slice(0, 5).map(c => c.nombre.trim())
    };
  } catch (err) {
    logger.error('Error fetching birthdays', err, 'Dashboard');
    return { count: 0, names: [] };
  }
}

export async function fetchExpiringBonuses(): Promise<{ count: number; names: string[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  const { data, error } = await fetchWithTimeout(
    supabase
      .from('bonos')
      .select('tipo, client:clientes_fidelizacion(nombre)')
      .eq('estado', 'Pendiente')
      .gte('fecha_vencimiento', today.toISOString())
      .lte('fecha_vencimiento', nextWeek.toISOString())
      .limit(10) as unknown as Promise<{ data: { tipo: string; client: { nombre: string } | { nombre: string }[] | null }[] | null; error: PostgrestError | null }>
  );

  if (error || !data) return { count: 0, names: [] };

  const names = data.map(b => {
    const nombre = Array.isArray(b.client) ? b.client[0]?.nombre : b.client?.nombre;
    return `${(nombre || 'Cliente').trim()} (${b.tipo})`;
  });

  // El conteo real lo sacamos con una consulta head para que sea exacto si hay muchos
  const totalCount = await fetchStatsHead('bonos', q => 
    q.eq('estado', 'Pendiente')
     .gte('fecha_vencimiento', today.toISOString())
     .lte('fecha_vencimiento', nextWeek.toISOString())
  );

  return { 
    count: totalCount, 
    names: names.slice(0, 5) 
  };
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

export async function fetchRecentActivity(): Promise<ActivityItem[]> {
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

export const getDashboardStats = async (role: AppRole | null): Promise<DashboardStats> => {
  const showRevenue = canPerform(role, 'VIEW_REVENUE');

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
    showRevenue ? fetchRevenueData() : Promise.resolve([]),
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
