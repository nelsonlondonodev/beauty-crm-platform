import { format, addMonths, parseISO, startOfMonth, endOfMonth, addDays } from 'date-fns';

/**
 * Formato ISO corto para comparaciones y envíos a API (YYYY-MM-DD).
 */
export const toISODate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Obtiene el rango de fechas para el mes actual en formato ISO.
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString()
  };
};

/**
 * Verifica si un cumpleaños ocurre en una ventana de días.
 * @param birthday - Fecha en formato YYYY-MM-DD
 * @param days - Ventana de días (incluyendo hoy)
 */
export const isBirthdayInRange = (birthday: string | null, days: number = 7): boolean => {
  if (!birthday) return false;
  
  const today = new Date();
  // Extraemos MM-DD para comparar sin importar el año
  const mmdd = birthday.substring(5, 10); 
  
  const upcomingDaysMMDD = new Set(Array.from({ length: days + 1 }).map((_, i) => {
    const d = addDays(today, i);
    return format(d, 'MM-dd');
  }));

  return upcomingDaysMMDD.has(mmdd);
};

/**
 * Calcula la fecha de expiración estándar.
 */
export const getStandardExpirationDate = (baseDate: string | Date = new Date(), months: number = 6): Date => {
  const date = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;
  return addMonths(date, months);
};

/**
 * Comprueba si una fecha ha pasado con respecto a hoy.
 */
export const hasExpired = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const date = parseISO(dateString);
  return date < new Date();
};
