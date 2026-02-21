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
  codigo?: string;
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

export interface BonoDbRow {
  id: string;
  client_id: string;
  estado: string;
  tipo: string;
  codigo?: string;
  fecha_vencimiento: string | null;
  fecha_canje: string | null;
  created_at: string;
}

export interface ClientDbRow {
  id: string;
  nombre: string;
  email: string | null;
  whatsapp: string | null;
  birthday: string | null;
  created_at: string;
  bonos?: BonoDbRow[];
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

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}
