import { useState, useCallback } from 'react';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  toCalendarEvents,
} from '../services/appointmentService';
import type { CreateAppointmentPayload } from '../services/appointmentService';
import { logger } from '../lib/logger';
import type { Appointment, CalendarEvent } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// ── Types ───────────────────────────────────────────────────────────────────

interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'resourceTimeGridDay';

// ── Date Range Helpers ──────────────────────────────────────────────────────

/**
 * Computes the visible date range for a given view and reference date.
 * Extends range slightly to include events that start/end near boundaries.
 */
const getDateRange = (date: Date, view: ViewType): { start: string; end: string } => {
  switch (view) {
    case 'timeGridDay':
    case 'resourceTimeGridDay': {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return { start: dayStart.toISOString(), end: dayEnd.toISOString() };
    }
    case 'timeGridWeek': {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return { start: weekStart.toISOString(), end: weekEnd.toISOString() };
    }
    case 'dayGridMonth':
    default: {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return { start: monthStart.toISOString(), end: monthEnd.toISOString() };
    }
  }
};

// ── Hook ────────────────────────────────────────────────────────────────────

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (date: Date, view: ViewType = 'dayGridMonth') => {
      try {
        setLoading(true);
        const { start, end } = getDateRange(date, view);
        const data = await getAppointments(start, end);
        setAppointments(data);
        setCalendarEvents(toCalendarEvents(data));
        setError(null);
      } catch (err) {
        logger.error('Error fetching appointments', err, 'useAppointments');
        setError(err instanceof Error ? err.message : 'Error al cargar citas');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addAppointment = async (
    appointment: CreateAppointmentPayload
  ): Promise<ServiceResult<Appointment>> => {
    try {
      const newAppointment = await createAppointment(appointment);
      setAppointments((prev) => [...prev, newAppointment]);
      setCalendarEvents((prev) => [...prev, ...toCalendarEvents([newAppointment])]);
      return { success: true, data: newAppointment };
    } catch (err) {
      logger.error('Error creating appointment', err, 'useAppointments');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al crear cita',
      };
    }
  };

  const editAppointment = async (
    id: string,
    updates: Partial<Appointment>
  ): Promise<ServiceResult<Appointment>> => {
    try {
      const updatedAppointment = await updateAppointment(id, updates);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updatedAppointment : a))
      );
      setCalendarEvents((prev) =>
        prev.map((e) =>
          e.id === id ? toCalendarEvents([updatedAppointment])[0] : e
        )
      );
      return { success: true, data: updatedAppointment };
    } catch (err) {
      logger.error('Error updating appointment', err, 'useAppointments');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar cita',
      };
    }
  };

  const removeAppointment = async (id: string): Promise<ServiceResult> => {
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err) {
      logger.error('Error deleting appointment', err, 'useAppointments');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al eliminar cita',
      };
    }
  };

  return {
    appointments,
    calendarEvents,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    editAppointment,
    removeAppointment,
  };
};
