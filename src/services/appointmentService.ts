import { supabase } from '../lib/supabase';
import type { Appointment, CalendarEvent } from '../types';
import { logger } from '../lib/logger';
import { addMinutes } from 'date-fns';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
const DEFAULT_DURATION_MINUTES = 60;

// ── Select Query ────────────────────────────────────────────────────────────

const APPOINTMENT_SELECT = `
  *,
  client:clientes_fidelizacion(nombre, email, whatsapp),
  empleado:empleados(id, nombre)
`;

// ── Data Transformers (Pure Functions) ──────────────────────────────────────

/**
 * Maps a raw Appointment row to a FullCalendar-compatible event.
 */
export const toCalendarEvent = (apt: Appointment): CalendarEvent => {
  const startDate = new Date(apt.fecha_cita);
  const duration = apt.duracion_minutos || DEFAULT_DURATION_MINUTES;
  const endDate = addMinutes(startDate, duration);

  return {
    id: apt.id,
    title: apt.servicio,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    resourceId: apt.empleado_id || undefined,
    extendedProps: {
      appointment: apt,
      clientName: apt.client?.nombre || 'Cliente desconocido',
      staffName: apt.empleado?.nombre || 'Sin asignar',
      status: apt.estado,
    },
  };
};

/**
 * Transforms an array of appointments into FullCalendar events.
 */
export const toCalendarEvents = (appointments: Appointment[]): CalendarEvent[] =>
  appointments.map(toCalendarEvent);

// ── CRUD Operations ─────────────────────────────────────────────────────────

export const getAppointments = async (
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .gte('fecha_cita', startDate)
    .lte('fecha_cita', endDate)
    .order('fecha_cita', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment[];
};

export const getAppointmentsByStaff = async (
  staffId: string,
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('empleado_id', staffId)
    .gte('fecha_cita', startDate)
    .lte('fecha_cita', endDate)
    .order('fecha_cita', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment[];
};

export interface CreateAppointmentPayload {
  client_id: string;
  empleado_id?: string | null;
  fecha_cita: string;
  duracion_minutos?: number;
  servicio: string;
  notas?: string;
  estado: 'programada';
  pago_estado: 'pendiente';
}

export const createAppointment = async (
  appointment: CreateAppointmentPayload
): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      ...appointment,
      duracion_minutos: appointment.duracion_minutos || DEFAULT_DURATION_MINUTES,
    }])
    .select(APPOINTMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Fire-and-forget notification to n8n
  notifyN8n(data as Appointment).catch((err) =>
    logger.error('Failed to notify n8n', err, 'Appointments')
  );

  return data as Appointment;
};

export const updateAppointment = async (
  id: string,
  updates: Partial<Appointment>
): Promise<Appointment> => {
  // Sanitize: remove read-only joined relations before sending to DB
  const { client, empleado, ...safeUpdates } = updates;
  void client;
  void empleado;

  const { data, error } = await supabase
    .from('appointments')
    .update(safeUpdates)
    .eq('id', id)
    .select(APPOINTMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase.from('appointments').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// ── n8n Integration ─────────────────────────────────────────────────────────

const notifyN8n = async (appointmentData: Appointment) => {
  if (!N8N_WEBHOOK_URL) return;

  // Si por alguna razón el join no vino (a veces pasa en inserts rápidos), 
  // intentamos sacar los datos básicos si están disponibles.
  let cliente_nombre = appointmentData.client?.nombre;
  let cliente_email = appointmentData.client?.email;
  let cliente_telefono = appointmentData.client?.whatsapp;

  // Si no tenemos los datos del cliente pero tenemos el ID, intentamos una búsqueda rápida
  // para no perder la notificación.
  if (!cliente_nombre && appointmentData.client_id) {
    try {
      const { data: clientData } = await supabase
        .from('clientes_fidelizacion')
        .select('nombre, email, whatsapp')
        .eq('id', appointmentData.client_id)
        .single();
      
      if (clientData) {
        cliente_nombre = clientData.nombre;
        cliente_email = clientData.email;
        cliente_telefono = clientData.whatsapp;
      }
    } catch (e) {
      logger.error('Could not fetch client data for n8n notification', e, 'Appointments');
    }
  }

  const payload = {
    cita_id: appointmentData.id,
    fecha_cita: appointmentData.fecha_cita,
    servicio: appointmentData.servicio,
    empleado_nombre: appointmentData.empleado?.nombre || 'Personal de Narbo\'s',
    cliente_nombre: cliente_nombre || 'Cliente',
    cliente_email: cliente_email || null,
    cliente_telefono: cliente_telefono || null,
    notas: appointmentData.notas || '',
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
  } catch (error) {
    logger.error('Error sending webhook to n8n', error, 'Appointments');
  }
};
