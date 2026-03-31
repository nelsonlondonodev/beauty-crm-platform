import { useState, useEffect } from 'react';
import {
  getClients,
  createClient,
  updateClient as updateClientService,
  deleteClient as deleteClientService,
} from '../services/clientService';
import { logger } from '../lib/logger';
import { useCrmEvent } from './useCrmEvent';
import { CRM_EVENTS } from '../lib/events';
import type { Client } from '../types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  // Refrescar datos cuando un bono es canjeado desde otro módulo
  useCrmEvent(CRM_EVENTS.BONO_REDEEMED, () => fetchClients());

  const fetchClients = async () => {
    setLoading(true);
    const res = await getClients();
    if (res.success) {
      setClients(res.data);
      setError(null);
    } else {
      logger.error('Error fetching clients', res.error, 'useClients');
      setError(res.error);
    }
    setLoading(false);
  };

  const addClient = async (newClient: Omit<Client, 'id' | 'bono_estado'>) => {
    const res = await createClient(newClient);
    if (res.success) {
      setClients((prev) => [res.data, ...prev]);
    } else {
      logger.error('Error adding client', res.error, 'useClients');
    }
    return res;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const res = await updateClientService(id, updates);
    if (res.success) {
      setClients((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } else {
      logger.error('Error updating client', res.error, 'useClients');
    }
    return res;
  };

  const deleteClient = async (id: string) => {
    const res = await deleteClientService(id);
    if (res.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    } else {
      logger.error('Error deleting client', res.error, 'useClients');
    }
    return res;
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
  };
};
