import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our type if necessary
      // For now, assuming the DB columns match our Client interface
      setClients(data as Client[]);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<Client, 'id' | 'bono_estado'>) => {
      try {
          const { data, error } = await supabase
            .from('clients')
            .insert([{
                ...newClient,
                bono_estado: 'pendiente' // Default status
            }])
            .select()
            .single();
            
          if (error) throw error;
          
          setClients(prev => [data as Client, ...prev]);
          return { success: true, data };
      } catch (err: any) {
          console.error('Error adding client:', err);
          return { success: false, error: err.message };
      }
  };

  const deleteClient = async (id: string) => {
      try {
          const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

          if (error) throw error;

          setClients(prev => prev.filter(c => c.id !== id));
          return { success: true };
      } catch (err: any) {
          console.error('Error deleting client:', err);
          return { success: false, error: err.message };
      }
  }

  return { clients, loading, error, fetchClients, addClient, deleteClient };
};
