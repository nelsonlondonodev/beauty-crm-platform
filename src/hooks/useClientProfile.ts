import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientById, getClientFinancialHistory, updateClient } from '../services/clientService';
import type { Client, FacturaWithItems } from '../types';
import { toast } from 'sonner';

export const useClientProfile = (id: string | undefined) => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<FacturaWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchClientData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [clientData, invoicesData] = await Promise.all([
        getClientById(id),
        getClientFinancialHistory(id)
      ]);
      setClient(clientData);
      setInvoices(invoicesData);
    } catch {
      toast.error('Error al cargar el perfil del cliente');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const saveNotes = async (notes: string): Promise<boolean> => {
    if (!client || !id) return false;
    setIsSavingNotes(true);
    try {
      const updated = await updateClient(id, { notas: notes });
      setClient(updated);
      toast.success('Ficha técnica actualizada');
      return true;
    } catch {
      toast.error('Error al guardar las notas');
      return false;
    } finally {
      setIsSavingNotes(false);
    }
  };

  return {
    client,
    invoices,
    loading,
    isSavingNotes,
    saveNotes,
    refresh: fetchClientData
  };
};
