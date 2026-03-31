import { useState, useEffect } from 'react';
import { getFacturas } from '../services/billingService';
import type { FacturaWithClient } from '../types';
import { toast } from 'sonner';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<FacturaWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await getFacturas();
    if (res.success) {
      setInvoices(res.data);
    } else {
      toast.error(res.error || 'Error al cargar el historial de facturas');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    fetchInvoices
  };
};
