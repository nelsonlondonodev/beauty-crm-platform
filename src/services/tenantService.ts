import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';
import type { TenantConfig } from '../contexts/TenantContext';
import type { PostgrestError } from '@supabase/supabase-js';

// --- Interfaces ---

/** Campos exactos de la tabla tenant_config en Supabase */
interface TenantDbRow {
  user_id: string;
  brand_name: string | null;
  tagline: string | null;
  support_email: string | null;
  logo_url: string | null;
  commission_policy: string | null;
  updated_at: string;
}

// --- Utilidades de Mapeo (Internas) ---

/**
 * Transforma un registro de base de datos al formato TenantConfig de la aplicación.
 */
function mapDbToTenantConfig(row: TenantDbRow): TenantConfig {
  return {
    brandName: row.brand_name || 'Londy',
    tagline: row.tagline || 'Beauty Industry CRM',
    supportEmail: row.support_email || '',
    logoUrl: row.logo_url || '',
    commissionPolicy: (row.commission_policy as 'gross' | 'net') || 'gross',
  };
}

// --- Funciones de Servicio ---

/**
 * Obtiene la configuración de marca blanca para un usuario (Owner) específico.
 */
export const fetchTenantConfig = async (userId: string): Promise<TenantConfig | null> => {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('tenant_config')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() as unknown as Promise<{ data: TenantDbRow | null; error: PostgrestError | null }>
    );

    if (error) {
      if (error.code === 'PGRST116') return null; // Registro no encontrado
      throw new Error(error.message);
    }

    return data ? mapDbToTenantConfig(data) : null;
  } catch (err) {
    logger.error('Error fetching tenant config', err, 'TenantService');
    return null;
  }
};

/**
 * Actualiza o crea la configuración de marca blanca (Marca Blanca Dinámica).
 */
export const updateTenantConfig = async (
  userId: string,
  updates: Partial<TenantConfig>
): Promise<void> => {
  const dbUpdates: Partial<TenantDbRow> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
  if (updates.supportEmail !== undefined) dbUpdates.support_email = updates.supportEmail;
  if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
  if (updates.commissionPolicy !== undefined) dbUpdates.commission_policy = updates.commissionPolicy;

  const { error } = await fetchWithTimeout(
    supabase
      .from('tenant_config')
      .upsert(
        { user_id: userId, ...dbUpdates },
        { onConflict: 'user_id' }
      ) as unknown as Promise<{ error: PostgrestError | null }>
  );

  if (error) {
    logger.error('Error updating tenant config', error.message, 'TenantService');
    throw new Error(error.message);
  }
};
