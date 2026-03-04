import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { APP_CONFIG } from '../config/brand';
import { fetchTenantConfig } from '../services/tenantService';

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

const defaultConfig: TenantConfig = {
  brandName: APP_CONFIG.brandName,
  tagline: APP_CONFIG.tagline,
};

const defaultContext: TenantContextType = {
  config: defaultConfig,
  loading: true,
  refreshConfig: async () => {},
};

const TenantContext = createContext<TenantContextType>(defaultContext);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<TenantConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const loadTenantData = async () => {
    if (!user) {
      setConfig(defaultConfig);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Delega la obtención de datos al servicio modularizado
    const tenantData = await fetchTenantConfig(user.id);
    
    if (tenantData) {
      setConfig(tenantData);
    } else {
      setConfig(defaultConfig);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTenantData();
  }, [user]);

  return (
    <TenantContext.Provider value={{ config, loading, refreshConfig: loadTenantData }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
