export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

export type BonusStatus = 'pendiente' | 'reclamado' | 'vencido' | 'alerta_5_meses';

export interface ClientBonusDisplay {
  id: string;
  tipo: string;
  estado: BonusStatus;
  fecha_vencimiento: string;
}

export interface Client {
  id: string; // Adaptado para soportar UUID (v5)
  nombre: string;
  email: string;
  telefono: string; // Mapeado desde 'whatsapp' en la DB
  fecha_nacimiento: string; // Mapeado desde 'birthday' en la DB
  bono_estado: BonusStatus; // Calculado en el frontend basado en fechas/canjeado
  bono_fecha_vencimiento: string; // Calculado en el frontend
  bono_tipo?: string; // Nombre del bono más reciente
  bonos_historial?: ClientBonusDisplay[]; // Para mostrar múltiples bonos si existen
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
