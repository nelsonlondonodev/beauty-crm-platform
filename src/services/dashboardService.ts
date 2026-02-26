import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, addDays, addMonths } from 'date-fns';

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

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 1. Total Clients
  const { count: totalClients, error: totalError } = await supabase
    .from('clientes_fidelizacion') // Tabla real
    .select('*', { count: 'exact', head: true });

  if (totalError)
    throw new Error(`Error fetching total clients: ${totalError.message}`);

  // 2. New Clients This Month
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { count: newClients, error: newClientsError } = await supabase
    .from('clientes_fidelizacion')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lte('created_at', end);

  if (newClientsError)
    throw new Error(`Error fetching new clients: ${newClientsError.message}`);

  // 3. Active Bonuses (In DB: estado = 'Pendiente' on bonos table)
  const { count: activeBonuses, error: activeBonusesError } = await supabase
    .from('bonos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'Pendiente');

  if (activeBonusesError)
    throw new Error(
      `Error fetching active bonuses: ${activeBonusesError.message}`
    );

  // 4. Upcoming Birthdays (Next 7 days)
  const { data: allClients, error: clientsError } = await supabase
    .from('clientes_fidelizacion')
    .select('birthday');

  if (clientsError)
    throw new Error(
      `Error fetching clients for dates: ${clientsError.message}`
    );

  // 5. Expiring Bonuses (Next 7 days)
  const { data: allBonuses, error: bonusesError } = await supabase
    .from('bonos')
    .select('created_at, fecha_vencimiento')
    .eq('estado', 'Pendiente');

  if (bonusesError)
    throw new Error(
      `Error fetching bonuses for dates: ${bonusesError.message}`
    );

  let upcomingBirthdaysCount = 0;
  let expiringBonusesCount = 0;

  const today = new Date();
  // Normalize today to start of day for exact comparison
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  if (allClients) {
    upcomingBirthdaysCount = allClients.filter((c) => {
      if (!c.birthday) return false;
      // Parse date carefully
      // Append time to prevent UTC offset shifting the day
      const dob = new Date(`${c.birthday}T12:00:00Z`);

      // Create date for this year
      const thisYearBirthday = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate()
      );

      return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
    }).length;
  }

  if (allBonuses) {
    expiringBonusesCount = allBonuses.filter((b) => {
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

  let revenueData: RevenueData[] = [];

  // 6. Ingresos de los últimos 7 meses
  // Calculamos la fecha de corte (hace 6 meses + el mes actual)
  const sixMonthsAgo = startOfMonth(addMonths(today, -6));
  const { data: facturas, error: facturasError } = await supabase
    .from('facturas')
    .select('fecha_venta, total')
    .gte('fecha_venta', sixMonthsAgo.toISOString());

  if (facturasError) {
    console.error(
      `Error fetching facturas for revenue: ${facturasError.message}`
    );
  } else if (facturas) {
    // Array con los nombres de los meses en español
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    // Inicializar el arreglo de los últimos 7 meses (ordenados del más antiguo al más reciente)
    for (let i = 6; i >= 0; i--) {
      const targetDate = addMonths(today, -i);
      revenueData.push({
        name: monthNames[targetDate.getMonth()],
        ingresos: 0,
        // guardamos month y year local temporalmente para simplificar la suma
        _month: targetDate.getMonth(),
        _year: targetDate.getFullYear(),
      } as any);
    }

    // Sumamos los totales de las facturas en el mes correspondiente
    facturas.forEach((factura) => {
      if (!factura.fecha_venta) return;
      const fDate = new Date(factura.fecha_venta);
      const fMonth = fDate.getMonth();
      const fYear = fDate.getFullYear();

      const bucket = revenueData.find(
        (b: any) => b._month === fMonth && b._year === fYear
      );
      if (bucket) {
        bucket.ingresos += Number(factura.total) || 0;
      }
    });

    // Limpiamos los campos temporales
    revenueData = revenueData.map((b) => ({
      name: b.name,
      ingresos: b.ingresos,
    }));
  }

  // 7. Actividad Reciente (Combinada de varias tablas)
  let recentActivity: ActivityItem[] = [];

  try {
    const [appointmentsRes, clientsRes, ventasRes, bonosRes] =
      await Promise.all([
        supabase
          .from('appointments')
          .select(
            'id, created_at, servicio, client:clientes_fidelizacion(nombre)'
          )
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
          .select('id, fecha_canje, tipo, client:clientes_fidelizacion(nombre)')
          .not('fecha_canje', 'is', null)
          .order('fecha_canje', { ascending: false })
          .limit(5),
      ]);

    if (appointmentsRes.data) {
      appointmentsRes.data.forEach((a: any) => {
        let nombre = 'Cliente desconocido';
        // Handle nested client representation from supabase join
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
      clientsRes.data.forEach((c: any) => {
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
      ventasRes.data.forEach((v: any) => {
        recentActivity.push({
          id: `ven-${v.id}`,
          type: 'sale',
          title: 'Venta Procesada',
          description: `Nueva factura generada en el sistema`,
          timestamp: v.fecha_venta,
        });
      });
    }

    if (bonosRes.data) {
      bonosRes.data.forEach((b: any) => {
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
          timestamp: b.fecha_canje,
        });
      });
    }

    // Ordenar de más reciente a más antigua
    recentActivity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Quedarse solo con las últimas 10 actividades en total
    recentActivity = recentActivity.slice(0, 10);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
  }

  return {
    totalClients: totalClients || 0,
    newClientsThisMonth: newClients || 0,
    activeBonuses: activeBonuses || 0,
    upcomingBirthdays: upcomingBirthdaysCount,
    expiringBonuses: expiringBonusesCount,
    revenueData,
    recentActivity,
  };
};
