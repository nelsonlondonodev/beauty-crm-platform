import { supabase } from '../lib/supabase';
import type { Appointment } from '../types';

const N8N_WEBHOOK_URL = 'https://n8n.srv1033442.hstgr.cloud/webhook/nueva-cita';

export const getAppointments = async (startDate: string, endDate: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, client:clientes_fidelizacion(nombre, email, whatsapp)') // Join with real table
    .gte('fecha_cita', startDate)
    .lte('fecha_cita', endDate)
    .order('fecha_cita', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment[];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  // 1. Insertar la cita y recuperar datos del cliente
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select('*, client:clientes_fidelizacion(nombre, email, whatsapp)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // 2. Notificar a n8n (Asíncrono, "fire and forget")
  // No esperamos a que termine para no bloquear la UI
  notifyN8n(data).catch(err => console.error('Failed to notify n8n:', err));

  return data as Appointment;
};

const notifyN8n = async (appointmentData: any) => {
  if (!appointmentData.client) return;

  const payload = {
    cita_id: appointmentData.id,
    fecha_cita: appointmentData.fecha_cita,
    servicio: appointmentData.servicio,
    cliente_nombre: appointmentData.client.nombre,
    cliente_email: appointmentData.client.email,
    cliente_telefono: appointmentData.client.whatsapp
  };

  try {
    await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error sending webhook to n8n:', error);
    // No lanzamos error para no afectar la experiencia del usuario en el frontend
  }
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select('*, client:clientes_fidelizacion(nombre, email, whatsapp)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
