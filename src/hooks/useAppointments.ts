import { useState, useCallback } from 'react';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
import type { Appointment } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();
      const data = await getAppointments(start, end);
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await createAppointment(appointment);
      setAppointments(prev => [...prev, newAppointment]);
      return { success: true, data: newAppointment };
    } catch (err) {
      console.error('Error creating appointment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error al crear cita' };
    }
  };

  const editAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointment = await updateAppointment(id, updates);
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return { success: true, data: updatedAppointment };
    } catch (err) {
      console.error('Error updating appointment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar cita' };
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting appointment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error al eliminar cita' };
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    editAppointment,
    removeAppointment
  };
};
