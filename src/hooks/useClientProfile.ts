import { useState, useEffect, useCallback } from 'react';
import { getClientById, getClientFinancialHistory, updateClient } from '../services/clientService';
import type { Client, FacturaWithItems } from '../types';
import { toast } from 'sonner';

export const useClientProfile = (id: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<FacturaWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchClientData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    
    const [clientRes, historyRes] = await Promise.all([
      getClientById(id),
      getClientFinancialHistory(id)
    ]);

    if (clientRes.success) {
      setClient(clientRes.data);
    } else {
      toast.error(clientRes.error);
    }

    if (historyRes.success) {
      setInvoices(historyRes.data);
    }
    
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const saveNotes = async (notes: string): Promise<boolean> => {
    if (!client || !id) return false;
    setIsSavingNotes(true);
    const res = await updateClient(id, { notas: notes });
    setIsSavingNotes(false);

    if (res.success) {
      setClient(res.data);
      toast.success('Ficha técnica actualizada');
      return true;
    } else {
      toast.error(res.error);
      return false;
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
