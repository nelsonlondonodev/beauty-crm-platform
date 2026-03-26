import { describe, it, expect } from 'vitest';
import { canPerform, hasRequiredRole } from './rbac';

describe('RBAC Security Rules', () => {
  it('Superadmin should access everything', () => {
    expect(canPerform('superadmin', 'VIEW_REVENUE')).toBe(true);
    expect(canPerform('superadmin', 'MANAGE_TENANTS')).toBe(true);
  });

  it('Owner should access revenue but NOT manage tenants', () => {
    expect(canPerform('owner', 'VIEW_REVENUE')).toBe(true);
    expect(canPerform('owner', 'MANAGE_TENANTS')).toBe(false);
  });

  it('Admin/Cajero should NOT access revenue', () => {
    expect(canPerform('admin', 'VIEW_REVENUE')).toBe(false);
    expect(canPerform('admin', 'REDEEM_BONUS')).toBe(true);
  });

  it('Staff only accesses basic operations', () => {
    expect(canPerform('staff', 'VIEW_REVENUE')).toBe(false);
    expect(canPerform('staff', 'VIEW_CLIENTS')).toBe(true);
  });

  it('Null role or non-existent roles should default strictly to FALSE', () => {
    expect(canPerform(null, 'VIEW_CLIENTS')).toBe(false);
    // @ts-expect-error testing invalid role
    expect(canPerform('hacker', 'VIEW_CLIENTS')).toBe(false);
  });

  describe('hasRequiredRole Validator', () => {
    it('returns true if role is in allowed list', () => {
      expect(hasRequiredRole('admin', ['owner', 'admin'])).toBe(true);
    });

    it('returns false if role is not in allowed list', () => {
      expect(hasRequiredRole('staff', ['owner', 'admin'])).toBe(false);
    });
  });
});
