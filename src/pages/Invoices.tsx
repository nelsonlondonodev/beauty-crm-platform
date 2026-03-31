import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { getFacturas } from '../services/billingService';
import type { FacturaWithClient } from '../types';
import { formatDate } from '../lib/formatters';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

const Invoices = () => {
  const [invoices, setInvoices] = useState<FacturaWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.clientes_fidelizacion?.nombre || 'Consumidor Final').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Historial de Ventas" 
        subtitle="Consulta todas las facturas emitidas y el detalle de cada transacción."
      />

      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            className="focus:border-primary focus:ring-primary h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pr-4 pl-9 text-sm transition-all outline-none focus:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50/50 text-xs text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold text-center">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-right">Subtotal</th>
                  <th className="px-6 py-4 font-semibold text-right text-green-600">Descuento</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-right">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{formatDate(inv.fecha_venta ?? '')}</span>
                        <span className="text-[10px] text-gray-400 font-mono">#{inv.id.substring(0,8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {inv.clientes_fidelizacion?.nombre || 'Consumidor Final'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${inv.subtotal?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                      {inv.descuento > 0 ? `-$${inv.descuento.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${inv.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                        {inv.metodo_pago}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron ventas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
