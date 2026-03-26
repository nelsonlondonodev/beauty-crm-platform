import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import type { Client } from '../../types';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../../lib/formatters';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { canPerform } from '../../lib/rbac';
import { DataTable } from '../ui/DataTable';
import type { ColumnDef } from '../../types/table';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  loading?: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const { role } = useAuth();

  const columns: ColumnDef<Client>[] = [
    {
      header: 'Cliente',
      cell: (client) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-bold">
            {client.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link 
              to={`/clients/${client.id}`}
              className="font-semibold text-gray-900 hover:text-primary transition-colors"
            >
              {client.nombre}
            </Link>
            <div className="text-xs text-gray-400">
              ID: {String(client.id).slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contacto',
      cell: (client) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            <span>{client.telefono}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Estado del Bono',
      cell: (client) => (
        <div className="flex flex-col gap-2 align-top">
          {client.bonos_historial && client.bonos_historial.length > 0 ? (
            client.bonos_historial.map((bono, idx) => (
              <div
                key={bono.id || idx}
                className="flex h-6 items-center gap-2"
              >
                <span
                  className={cn(
                    'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                    getStatusColor(bono.estado)
                  )}
                >
                  {`Bono ${bono.tipo}: `}
                  {getStatusLabel(bono.estado)}
                </span>
                {bono.codigo && (
                  <span className="rounded border border-gray-100 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-500 select-all">
                    {bono.codigo}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-6 items-center">
              <span
                className={cn(
                  'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                  getStatusColor(client.bono_estado)
                )}
              >
                {client.bono_tipo ? `Bono ${client.bono_tipo}: ` : ''}
                {getStatusLabel(client.bono_estado)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Vencimiento Bono',
      cell: (client) => (
        <div className="flex flex-col gap-2 text-gray-700 align-top">
          {client.bonos_historial && client.bonos_historial.length > 0 ? (
            client.bonos_historial.map((bono, idx) => (
              <div
                key={`venc-${bono.id || idx}`}
                className="flex h-6 items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm whitespace-nowrap">
                  {formatDate(bono.fecha_vencimiento)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex h-6 items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm whitespace-nowrap">
                {formatDate(client.bono_fecha_vencimiento)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right w-32',
      cell: (client) => (
        <div className="flex justify-end gap-2">
          <Link
            to={`/clients/${client.id}`}
            className="hover:bg-primary/5 hover:text-primary rounded-lg p-2 text-gray-400 transition-colors"
            title="Ver Perfil Financiero"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onEdit(client)}
            className="hover:bg-primary/5 hover:text-primary rounded-lg p-2 text-gray-400 transition-colors"
            title="Editar Cliente"
          >
            <Edit className="h-4 w-4" />
          </button>
          {canPerform(role, 'DELETE_CLIENT') && (
            <button
              onClick={() => onDelete(client)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Eliminar Cliente"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <DataTable<Client>
        data={clients}
        columns={columns}
        keyExtractor={(client) => client.id}
        emptyMessage="No se encontraron clientes que coincidan con tu búsqueda."
        loading={loading}
        className="rounded-none border-0 shadow-none"
      />
      <div className="bg-white flex items-center justify-between border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
        <span>
          Mostrando <span className="font-medium text-gray-900">{clients.length}</span> resultados
        </span>
      </div>
    </div>
  );
};

export default ClientTable;
