import { supabase } from '../lib/supabase';
import type { Appointment } from '../types';

export const getAppointments = async (startDate: string, endDate: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, client:clients(nombre, email, telefono)') // Join with clients table
    .gte('fecha_cita', startDate)
    .lte('fecha_cita', endDate)
    .order('fecha_cita', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment[];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment;
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
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
