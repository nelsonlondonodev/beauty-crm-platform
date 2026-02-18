import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient as updateClientService, deleteClient as deleteClientService } from '../services/clientService';
import type { Client } from '../types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<Client, 'id' | 'bono_estado'>) => {
      try {
          const data = await createClient(newClient);
          setClients(prev => [data, ...prev]);
          return { success: true, data };
      } catch (err) {
          console.error('Error adding client:', err);
          return { success: false, error: err instanceof Error ? err.message : 'Error desconocido al crear cliente' };
      }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
      try {
          const data = await updateClientService(id, updates);
          setClients(prev => prev.map(c => c.id === id ? data : c));
          return { success: true, data };
      } catch (err) {
          console.error('Error updating client:', err);
          return { success: false, error: err instanceof Error ? err.message : 'Error desconocido al actualizar cliente' };
      }
  };

  const deleteClient = async (id: string) => {
      try {
          await deleteClientService(id);
          setClients(prev => prev.filter(c => c.id !== id));
          return { success: true };
      } catch (err) {
          console.error('Error deleting client:', err);
          return { success: false, error: err instanceof Error ? err.message : 'Error desconocido al eliminar cliente' };
      }
  }

  return { clients, loading, error, fetchClients, addClient, updateClient, deleteClient };
};
