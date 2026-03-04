import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isBirthdayInRange, hasExpired, getStandardExpirationDate } from '../lib/dateUtils';
import { format, addDays, subDays } from 'date-fns';

describe('dateUtils', () => {
  beforeEach(() => {
    // Fijamos "hoy" a una fecha conocida para que los tests sean deterministicos
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T12:00:00Z')); 
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isBirthdayInRange', () => {
    it('debe detectar un cumpleaños que es hoy', () => {
      const todayMMDD = format(new Date(), 'yyyy-MM-dd'); // 2026-03-04
      expect(isBirthdayInRange(todayMMDD)).toBe(true);
    });

    it('debe detectar un cumpleaños dentro de la ventana de 7 días (por defecto)', () => {
      const in6Days = addDays(new Date(), 6);
      const birthday = format(in6Days, 'yyyy-MM-dd');
      expect(isBirthdayInRange(birthday)).toBe(true);
    });

    it('no debe detectar un cumpleaños fuera de la ventana (8 días)', () => {
      const in8Days = addDays(new Date(), 8);
      const birthday = format(in8Days, 'yyyy-MM-dd');
      expect(isBirthdayInRange(birthday)).toBe(false);
    });

    it('debe funcionar con cumpleaños de años pasados (puro MMDD)', () => {
      // Si hoy es Marzo 4, alguien nacido en 1990-03-05 cumple mañana
      const birthday = '1990-03-05';
      expect(isBirthdayInRange(birthday, 7)).toBe(true);
    });

    it('no debe lanzar error si la fecha es null o inválida', () => {
      expect(isBirthdayInRange(null)).toBe(false);
      expect(isBirthdayInRange('')).toBe(false);
    });
  });

  describe('hasExpired', () => {
    it('debe retornar true para una fecha pasada', () => {
      const past = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      expect(hasExpired(past)).toBe(true);
    });

    it('debe retornar false para una fecha futura', () => {
      const future = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      expect(hasExpired(future)).toBe(false);
    });
  });

    it('debe calcular 6 meses desde hoy por defecto', () => {
      const base = new Date('2026-01-01T12:00:00Z');
      const result = getStandardExpirationDate(base, 6);
      expect(result.toISOString()).toContain('2026-07-01');
    });
});
