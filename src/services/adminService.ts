import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { fetchWithTimeout } from '../lib/utils';
import type { PostgrestError } from '@supabase/supabase-js';

export interface PlatformStats {
  totalSalons: number;
  totalUsers: number;
  activeSubscriptions: number;
  systemUptime: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  owner: string;
  status: 'Activo' | 'Pendiente' | 'Inactivo';
  plan: string;
}

/**
 * Obtiene estadísticas globales del sistema para el SuperAdmin.
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
  try {
    const [salonsCount, usersCount] = await Promise.all([
      fetchCount('tenant_config'),
      fetchCount('user_roles')
    ]);

    return {
      totalSalons: salonsCount,
      totalUsers: usersCount,
      activeSubscriptions: salonsCount, // Por ahora 1:1
      systemUptime: '99.99%',
    };
  } catch (err) {
    logger.error('Error fetching platform stats', err, 'AdminService');
    return {
      totalSalons: 0,
      totalUsers: 0,
      activeSubscriptions: 0,
      systemUptime: '0%',
    };
  }
};

interface RawTenantData {
  user_id: string;
  brand_name: string | null;
  user_roles: {
    user_id: string;
  }[];
}

/**
 * Obtiene la lista de todos los inquilinos (tenants) registrados.
 */
export const getTenantsList = async (): Promise<TenantInfo[]> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('tenant_config')
        .select(`
          user_id,
          brand_name,
          user_roles!inner(user_id)
        `) as unknown as Promise<{ data: RawTenantData[] | null; error: PostgrestError | null }>
    );

    if (error || !data) throw new Error(error?.message || 'No data found');

    return data.map(t => ({
      id: t.user_id,
      name: t.brand_name || 'Sin nombre',
      owner: t.user_roles?.[0]?.user_id || 'Propietario',
      status: 'Activo',
      plan: 'Premium'
    }));
  } catch (err) {
    logger.error('Error fetching tenants list', err, 'AdminService');
    return [];
  }
};

async function fetchCount(table: string): Promise<number> {
  const { count, error } = await fetchWithTimeout(
    supabase.from(table).select('*', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );
  if (error) return 0;
  return count || 0;
}
