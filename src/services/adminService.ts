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

export interface CreateTenantPayload {
  brandName: string;
  ownerId: string;
  plan: string;
}

/**
 * Obtiene estadísticas globales del sistema para el SuperAdmin.
 * Refactorizado para asegurar consistencia con la lista de salones reales.
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
  try {
    // Obtenemos los datos reales para asegurar coherencia
    const tenants = await getTenantsList();
    const usersCount = await fetchCount('user_roles');

    return {
      totalSalons: tenants.length,
      totalUsers: usersCount,
      activeSubscriptions: tenants.length, // Basado solo en salones operativos
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

/**
 * Crea un nuevo salón (Tenant) y asigna el rol de dueño al usuario correspondiente.
 */
export const createTenant = async (payload: CreateTenantPayload): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Crear la configuración del salón
    const { error: configError } = await fetchWithTimeout(
      supabase.from('tenant_config').insert({
        user_id: payload.ownerId,
        brand_name: payload.brandName,
        commission_policy: 'gross'
      }) as unknown as Promise<{ error: PostgrestError | null }>
    );

    if (configError) throw new Error(`Error en tenant_config: ${configError.message}`);

    // 2. Asignar el rol de owner y establecer el tenant_id
    // Nota: En este sistema, el user_id del salón es el tenant_id
    const { error: roleError } = await fetchWithTimeout(
      supabase.from('user_roles').upsert({
        user_id: payload.ownerId,
        role: 'owner',
        tenant_id: payload.ownerId
      }, { onConflict: 'user_id' }) as unknown as Promise<{ error: PostgrestError | null }>
    );

    if (roleError) throw new Error(`Error en user_roles: ${roleError.message}`);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido al crear salón';
    logger.error('Error creating tenant', err, 'AdminService');
    return { success: false, error: message };
  }
};

async function fetchCount(table: string): Promise<number> {
  const { count, error } = await fetchWithTimeout(
    supabase.from(table).select('*', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null; error: PostgrestError | null }>
  );
  if (error) return 0;
  return count || 0;
}
