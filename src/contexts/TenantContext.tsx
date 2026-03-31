import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { APP_CONFIG } from '../config/brand';
import { fetchTenantConfig } from '../services/tenantService';

export interface TenantConfig {
  brandName: string;
  tagline: string;
  supportEmail?: string;
  logoUrl?: string;
  commissionPolicy: 'gross' | 'net';
}

interface TenantContextType {
  config: TenantConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const defaultConfig: TenantConfig = {
  brandName: APP_CONFIG.brandName,
  tagline: APP_CONFIG.tagline,
  commissionPolicy: 'gross',
};

const defaultContext: TenantContextType = {
  config: defaultConfig,
  loading: true,
  refreshConfig: async () => {},
};

const TenantContext = createContext<TenantContextType>(defaultContext);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, tenantId } = useAuth();
  const [config, setConfig] = useState<TenantConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const loadTenantData = useCallback(async () => {
    if (!user) {
      setConfig(defaultConfig);
      setLoading(false);
      return;
    }

    setLoading(true);
    const targetId = tenantId || user.id;
    const tenantData = await fetchTenantConfig(targetId);
    
    if (tenantData) {
      setConfig(tenantData);
    } else {
      setConfig(defaultConfig);
    }
    setLoading(false);
  }, [user, tenantId]);

  // Load tenant data on mount and when user changes
  useEffect(() => {
    const init = async () => {
      await loadTenantData();
    };
    init();
  }, [loadTenantData]);

  return (
    <TenantContext.Provider value={{ config, loading, refreshConfig: loadTenantData }}>
      {children}
    </TenantContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTenant = () => useContext(TenantContext);

