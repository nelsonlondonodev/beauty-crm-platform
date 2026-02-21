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

export interface Empleado {
  id: string;
  nombre: string;
  rol: string;
  comision_porcentaje: number;
  activo: boolean;
  created_at?: string;
}

export interface Factura {
  id: string;
  cliente_id?: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago?: string;
  fecha_venta?: string;
}

export interface FacturaItem {
  id: string;
  factura_id: string;
  empleado_id?: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  comision_monto: number;
  created_at?: string;
}

export interface PagoComision {
  id: string;
  empleado_id: string;
  monto_pagado: number;
  fecha_pago?: string;
  notas?: string;
}
