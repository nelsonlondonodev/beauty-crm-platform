import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/utils';
import { logger } from '../lib/logger';
import type { TenantConfig } from '../contexts/TenantContext';
import type { PostgrestError } from '@supabase/supabase-js';

/** Campos de la tabla tenant_config en Supabase */
interface TenantDbRow {
  user_id: string;
  brand_name?: string;
  tagline?: string;
  support_email?: string;
  logo_url?: string;
  updated_at: string;
}

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

  // Se usa upsert para crearlo automáticamente si el "Owner" aún no tiene una fila en la base de datos
  const response = await fetchWithTimeout(
    supabase
      .from('tenant_config')
      .upsert(
        { user_id: userId, ...dbUpdates },
        { onConflict: 'user_id' }
      ) as unknown as Promise<{ error: PostgrestError | null }>
  );

  if (response.error) {
    logger.error('Error updating tenant config', response.error.message, 'TenantService');
    throw new Error(response.error.message);
  }
};
