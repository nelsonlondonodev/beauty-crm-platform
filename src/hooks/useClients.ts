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
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      logger.error('Error fetching clients', err, 'useClients');
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al cargar clientes'
      );
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<Client, 'id' | 'bono_estado'>) => {
    try {
      const data = await createClient(newClient);
      setClients((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      logger.error('Error adding client', err, 'useClients');
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Error desconocido al crear cliente',
      };
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const data = await updateClientService(id, updates);
      setClients((prev) => prev.map((c) => (c.id === id ? data : c)));
      return { success: true, data };
    } catch (err) {
      logger.error('Error updating client', err, 'useClients');
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Error desconocido al actualizar cliente',
      };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteClientService(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      logger.error('Error deleting client', err, 'useClients');
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Error desconocido al eliminar cliente',
      };
    }
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
