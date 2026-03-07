import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Receipt } from 'lucide-react';
import { getClientById, getClientFinancialHistory } from '../services/clientService';
import type { Client, Factura } from '../types';
import { formatDate, getStatusColor, getStatusLabel } from '../lib/formatters';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;
      try {
        const [clientData, invoicesData] = await Promise.all([
          getClientById(id),
          getClientFinancialHistory(id)
        ]);
        setClient(clientData);
        setInvoices(invoicesData);
      } catch (error) {
        toast.error('Error al cargar el perfil del cliente');
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-gray-500">
        <p>Cliente no encontrado.</p>
        <button onClick={() => navigate('/clients')} className="text-primary underline">
          Volver a Clientes
        </button>
      </div>
    );
  }

  const totalSpent = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalVisits = invoices.length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="hover:bg-primary/5 hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Perfil del Cliente
          </h1>
          <p className="text-sm text-gray-500">
            Historial financiero y detalles de {client.nombre}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Info & LTV */}
        <div className="space-y-6 lg:col-span-1">
          {/* Client Info Card */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col items-center border-b border-gray-100 p-6 text-center">
              <div className="bg-primary/10 text-primary mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold shadow-sm">
                {client.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{client.nombre}</h2>
              <p className="text-sm text-gray-500">
                Cliente desde {client.bonos_historial && client.bonos_historial.length > 0 
                  ? 'hace tiempo' // We could use actual created_at if added to Client type
                  : 'recientemente'}
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Información de Contacto
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.email || 'Sin correo electrónico'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.telefono || 'Sin teléfono'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.fecha_nacimiento ? formatDate(client.fecha_nacimiento) : 'No registra cumpleaños'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle & KPIs Card */}
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
            <h2 className="mb-2 text-sm font-medium text-gray-400">
              Valor de Vida del Cliente (LTV)
            </h2>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">${totalSpent.toLocaleString()}</span>
              <span className="text-sm text-gray-400">USD</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
              <div>
                <p className="text-xs text-gray-400">Visitas Totales</p>
                <p className="mt-1 text-lg font-semibold text-white">{totalVisits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ticket Promedio</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  ${totalVisits > 0 ? Math.round(totalSpent / totalVisits).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoices & Bonuses */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bonuses Section */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <User className="text-primary mr-2 h-5 w-5" />
              Estado de Fidelización
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {client.bonos_historial && client.bonos_historial.length > 0 ? (
                client.bonos_historial.map((bono) => (
                  <div key={bono.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{bono.tipo}</span>
                      <span className={cn('text-xs font-medium', getStatusColor(bono.estado))}>
                        {getStatusLabel(bono.estado)}
                      </span>
                    </div>
                    {bono.codigo && (
                      <div className="mt-2 text-xs text-gray-500">
                        Código: <span className="font-mono font-medium text-gray-900">{bono.codigo}</span>
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      Vence: {formatDate(bono.fecha_vencimiento)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  <p className="text-sm">No tiene bonos asociados en su historial.</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoices History */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Receipt className="text-primary mr-2 h-5 w-5" />
              Historial Financiero
            </h2>
            
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">ID Factura</th>
                    <th className="px-4 py-3 text-center">Descuento</th>
                    <th className="px-4 py-3 text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">
                          {inv.fecha_venta ? formatDate(inv.fecha_venta) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {inv.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-center text-green-600">
                          {inv.descuento > 0 ? `-$${inv.descuento.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${inv.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No hay registros de facturación para este cliente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
