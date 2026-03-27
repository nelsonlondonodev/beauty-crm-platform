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
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;
      try {
        const [clientData, invoicesData] = await Promise.all([
          getClientById(id),
          getClientFinancialHistory(id)
        ]);
        setClient(clientData);
        setNotesValue(clientData.notas || '');
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

  const handleSaveNotes = async () => {
    if (!client || !id) return;
    setIsSavingNotes(true);
    try {
      const { updateClient } = await import('../services/clientService');
      const updated = await updateClient(id, { notas: notesValue });
      setClient(updated);
      setEditingNotes(false);
      toast.success('Ficha técnica actualizada');
    } catch (error) {
      toast.error('Error al guardar las notas');
    } finally {
      setIsSavingNotes(false);
    }
  };

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

  // Extraer servicios únicos del historial (La Huella)
  const allServices = invoices.flatMap(inv => 
    (inv as any).factura_items?.map((item: any) => item.descripcion) || []
  );
  const serviceCounts = allServices.reduce((acc: Record<string, number>, s: string) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
            Historial de fidelización y detalles técnicos de {client.nombre}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Info & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Client Info Card */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col items-center border-b border-gray-100 p-6 text-center">
              <div className="bg-primary/10 text-primary mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold shadow-sm">
                {client.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{client.nombre}</h2>
              <p className="text-sm text-gray-500">
                Cliente Registrado
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

          {/* Ficha Técnica / Notas */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Ficha Técnica (Huella)
              </h3>
              {!editingNotes ? (
                <button 
                  onClick={() => setEditingNotes(true)}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Editar
                </button>
              ) : null}
            </div>
            
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-200 p-3 text-sm focus:ring-1 focus:outline-none"
                  rows={4}
                  placeholder="Escribe preferencias, alergias, tintes..."
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setEditingNotes(false);
                      setNotesValue(client.notas || '');
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="bg-primary rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSavingNotes ? 'Guardando...' : 'Guardar Ficha'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className={cn(
                  "text-sm leading-relaxed",
                  client.notas ? "text-gray-700" : "italic text-gray-400"
                )}>
                  {client.notas || "No hay información técnica registrada aún para este cliente."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: KPIs, Services & Bonuses */}
        <div className="space-y-6 lg:col-span-2">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
              <h2 className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Consumo Total (LTV)
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">${totalSpent.toLocaleString()}</span>
                <span className="text-xs text-gray-400">USD</span>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Frecuencia de Visita
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{totalVisits}</span>
                <span className="text-xs text-gray-500">visitas</span>
              </div>
            </div>
          </div>

          {/* Loyalty & Services Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
              <User className="text-primary mr-2 h-5 w-5" />
              Estado de Fidelización
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Timeline de Servicios */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Servicios más frecuentes
                </h3>
                {topServices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {topServices.map(([name, count]) => (
                      <span key={name} className="bg-primary/5 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border border-primary/10">
                        {name} <span className="ml-1.5 opacity-60">x{count}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Sin historial de servicios aún.</p>
                )}
              </div>
              
              {/* Bonos Activos */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Bonos Activos
                </h3>
                <div className="grid gap-3">
                  {client.bonos_historial && client.bonos_historial.length > 0 ? (
                    client.bonos_historial.map((bono) => (
                      <div key={bono.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{bono.tipo}</p>
                          <p className="text-[10px] text-gray-500">Vence: {formatDate(bono.fecha_vencimiento)}</p>
                        </div>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider', getStatusColor(bono.estado))}>
                          {getStatusLabel(bono.estado)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No registra cupones de fidelización.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoices History */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-lg font-semibold text-gray-900">
                <Receipt className="text-primary mr-2 h-5 w-5" />
                Historial de Visitas
              </h2>
            </div>
            
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
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
                        <td className="px-4 py-3 text-gray-600">
                          {inv.fecha_venta ? formatDate(inv.fecha_venta) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(inv as any).factura_items?.map((item: any, idx: number) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
