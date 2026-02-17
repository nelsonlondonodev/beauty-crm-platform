export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

export type BonusStatus = 'pendiente' | 'reclamado' | 'vencido' | 'alerta_5_meses';

export interface Client {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  bono_estado: BonusStatus;
  bono_fecha_vencimiento: string;
}

export interface Appointment {
  id: string;
  cliente_id: string;
  fecha_cita: string;
  servicio: string;
  estado: 'programada' | 'completada' | 'cancelada';
  pago_estado: 'pagado' | 'pendiente';
}

export interface DashboardStats {
  totalClients: number;
  activeBonuses: number;
  todayAppointments: number;
  upcomingBirthdays: number;
}
