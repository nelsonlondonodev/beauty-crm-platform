import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import ClientTable from '../components/clients/ClientTable';
import NewClientModal from '../components/clients/NewClientModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../contexts/AuthContext';
import { canPerform } from '../lib/rbac';
import { Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Client } from '../types';

const Clients = () => {
  const { clients, loading, addClient, updateClient, deleteClient } =
    useClients();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Activo' | 'Vencido'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Logic
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email &&
        client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.bonos_historial &&
        client.bonos_historial.some((b) =>
          b.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const statusMap: Record<string, string> = {
      Activo: 'pendiente',
      Vencido: 'vencido',
    };

    if (filter === 'all') return matchesSearch;

    const dbStatus = statusMap[filter];
    if (dbStatus === 'pendiente') {
      return (
        matchesSearch &&
        (client.bono_estado === 'pendiente' ||
          client.bono_estado === 'alerta_5_meses')
      );
    }
    return matchesSearch && client.bono_estado === dbStatus;
  });

  const handleSaveClient = async (
    clientData: Omit<Client, 'id' | 'bono_estado'>
  ) => {
    if (editingClient) {
      const result = await updateClient(editingClient.id, clientData);
      if (!result.success) alert('Error al actualizar: ' + result.error);
    } else {
      const result = await addClient(clientData);
      if (!result.success) alert('Error al guardar: ' + result.error);
    }
    setEditingClient(null);
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    setDeletingClient(client);
  };

  const confirmDelete = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    await deleteClient(deletingClient.id);
    setIsDeleting(false);
    setDeletingClient(null);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Gestión de Clientes"
        subtitle="Administra tu base de datos de clientes y sus fidelizaciones."
        actions={
          canPerform(role, 'MANAGE_CLIENTS') && (
            <button
              onClick={openNewClientModal}
              className="bg-primary hover:bg-primary/90 focus-visible:outline-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </button>
          )
        }
      />

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo..."
            className="focus:border-primary focus:ring-primary h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pr-4 pl-9 text-sm transition-all outline-none focus:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-gray-100/50 p-1">
            {(['all', 'Activo', 'Vencido'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ClientTable
          clients={filteredClients}
          onEdit={openEditClientModal}
          onDelete={handleDeleteClient}
        />
      )}

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        initialData={editingClient}
      />

      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={confirmDelete}
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar a ${deletingClient?.nombre ?? 'este cliente'}? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Clients;
