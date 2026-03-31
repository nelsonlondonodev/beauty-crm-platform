import { Receipt } from 'lucide-react';
import type { FacturaWithItems } from '../../../types';
import { formatDate } from '../../../lib/formatters';

interface ProfileFinancialHistoryProps {
  invoices: FacturaWithItems[];
}

const ProfileFinancialHistory = ({ invoices }: ProfileFinancialHistoryProps) => {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-gray-900">
          <Receipt className="text-primary mr-2 h-5 w-5" />
          Historial de Visitas
        </h2>
      </header>
      
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Servicios</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {inv.fecha_venta ? formatDate(inv.fecha_venta) : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inv.factura_items?.map((item, idx) => (
                        <span key={idx} className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.descripcion}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${inv.total.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No hay registros de facturación para este cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProfileFinancialHistory;
