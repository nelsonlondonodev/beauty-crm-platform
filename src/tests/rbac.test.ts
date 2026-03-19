import { describe, it, expect } from 'vitest';
import { canPerform, hasRequiredRole } from '../lib/rbac';
import type { AppAction } from '../lib/rbac';

describe('RBAC (Role Based Access Control)', () => {
  describe('canPerform(role, action)', () => {
    it('debe permitir al "owner" realizar cualquier acción', () => {
      const actions: AppAction[] = [
        'VIEW_DASHBOARD',
        'MANAGE_STAFF',
        'DELETE_CLIENT',
        'EDIT_SETTINGS'
      ];
      actions.forEach(action => {
        expect(canPerform('owner', action)).toBe(true);
      });
    });

    it('no debe permitir al "admin" (cajero) gestionar el personal (MANAGE_STAFF)', () => {
      expect(canPerform('admin', 'MANAGE_STAFF')).toBe(false);
    });

    it('no debe permitir al "staff" borrar clientes (DELETE_CLIENT)', () => {
      expect(canPerform('staff', 'DELETE_CLIENT')).toBe(false);
    });

    it('no debe permitir al "staff" gestionar personal (MANAGE_STAFF)', () => {
      expect(canPerform('staff', 'MANAGE_STAFF')).toBe(false);
    });

    it('debe permitir al "staff" ver clientes y agenda', () => {
      expect(canPerform('staff', 'VIEW_CLIENTS')).toBe(true);
      expect(canPerform('staff', 'VIEW_CALENDAR')).toBe(true);
    });

    it('debe retornar false si el rol es null o inválido', () => {
      expect(canPerform(null, 'VIEW_DASHBOARD')).toBe(false);
      // @ts-expect-error - Probando un rol fuera del tipo por seguridad
      expect(canPerform('invitado', 'VIEW_DASHBOARD')).toBe(false);
    });
  });

  describe('hasRequiredRole(currentRole, allowedRoles)', () => {
    it('debe retornar true si el rol está en la lista de permitidos', () => {
      expect(hasRequiredRole('owner', ['owner', 'admin'])).toBe(true);
    });

    it('debe retornar false si el rol no está en la lista de permitidos', () => {
      expect(hasRequiredRole('staff', ['owner', 'admin'])).toBe(false);
    });

    it('debe retornar false si el rol actual es null', () => {
      expect(hasRequiredRole(null, ['owner'])).toBe(false);
    });
  });
});
