import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { fetchWithTimeout } from '../lib/utils';
import { APP_CONFIG } from '../config/brand';
import { logger } from '../lib/logger';
import { PostgrestError } from '@supabase/supabase-js';

export interface TenantConfig {
  brandName: string;
  tagline: string;
  supportEmail?: string;
  logoUrl?: string;
}

interface TenantContextType {
  config: TenantConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const defaultContext: TenantContextType = {
  config: {
    brandName: APP_CONFIG.brandName,
    tagline: APP_CONFIG.tagline,
  },
  loading: true,
  refreshConfig: async () => {},
};

const TenantContext = createContext<TenantContextType>(defaultContext);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<TenantConfig>(defaultContext.config);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    if (!user) {
      setConfig(defaultContext.config);
      setLoading(false);
      return;
    }

    try {
      type TenantRow = { brand_name: string; tagline: string; support_email?: string; logo_url?: string };
      const { data, error } = await fetchWithTimeout(
        supabase
          .from('tenant_config')
          .select('brand_name, tagline, support_email, logo_url') // We omit user_id from filter since RLS handles it to our uid
          .maybeSingle() as unknown as Promise<{ data: TenantRow | null; error: PostgrestError | null }>
      );

      if (error) {
        logger.warn('Error fetching tenant config', error.message, 'Tenant');
        return;
      }

      if (data) {
        setConfig({
          brandName: data.brand_name || APP_CONFIG.brandName,
          tagline: data.tagline || APP_CONFIG.tagline,
          supportEmail: data.support_email,
          logoUrl: data.logo_url,
        });
      } else {
        setConfig(defaultContext.config);
      }
    } catch (err) {
      logger.error('Error in fetchConfig', err, 'Tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return (
    <TenantContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
