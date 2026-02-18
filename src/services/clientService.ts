import { supabase } from '../lib/supabase';
import type { Client } from '../types';

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Client[];
};

export const createClient = async (clientData: Omit<Client, 'id' | 'bono_estado'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      bono_estado: 'pendiente'
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Client;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Client;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
