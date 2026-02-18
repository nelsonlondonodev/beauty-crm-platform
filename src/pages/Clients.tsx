import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import ClientTable from '../components/clients/ClientTable';
import NewClientModal from '../components/clients/NewClientModal';
import { useClients } from '../hooks/useClients';
import { Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Client } from '../types';

const Clients = () => {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Activo' | 'Vencido'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Filter Logic
  const filteredClients = clients.filter(client => {
      const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const statusMap: Record<string, string> = {
          'Activo': 'pendiente',
          'Vencido': 'vencido'
      }

      if (filter === 'all') return matchesSearch;
      
      const dbStatus = statusMap[filter];
      if (dbStatus === 'pendiente') {
           return matchesSearch && (client.bono_estado === 'pendiente' || client.bono_estado === 'alerta_5_meses');
      }
      return matchesSearch && client.bono_estado === dbStatus;
  });

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'bono_estado'>) => {
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
  }

  const openEditClientModal = (client: Client) => {
      setEditingClient(client);
      setIsModalOpen(true);
  }

  const handleDeleteClient = async (id: string) => {
      if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
          await deleteClient(id);
      }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Gestión de Clientes" 
        subtitle="Administra tu base de datos de clientes y sus fidelizaciones."
        actions={
          <button 
            onClick={openNewClientModal}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </button>
        }
      />

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
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
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                            filter === f 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-500 hover:text-gray-900"
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    </div>
  );
};

export default Clients;
