import React from 'react';
import { Calendar as CalendarIcon, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import type { Client } from '../../types';
import { formatDate, getStatusColor, getStatusLabel } from '../../lib/formatters';
import { cn } from '../../lib/utils';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string | number) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Cliente</th>
              <th scope="col" className="px-6 py-4 font-semibold">Contacto</th>
              <th scope="col" className="px-6 py-4 font-semibold">Estado del Bono</th>
              <th scope="col" className="px-6 py-4 font-semibold">Vencimiento Bono</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {client.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{client.nombre}</div>
                      <div className="text-xs text-gray-400">ID: {String(client.id).slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    {client.bonos_historial && client.bonos_historial.length > 0 ? (
                       client.bonos_historial.map((bono, idx) => (
                         <div key={bono.id || idx} className="flex h-6 items-center gap-2">
                           <span className={cn(
                             "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset w-fit whitespace-nowrap",
                             getStatusColor(bono.estado)
                           )}>
                             {`Bono ${bono.tipo}: `}{getStatusLabel(bono.estado)}
                           </span>
                           {bono.codigo && (
                             <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 select-all">
                               {bono.codigo}
                             </span>
                           )}
                         </div>
                       ))
                    ) : (
                       <div className="flex h-6 items-center">
                         <span className={cn(
                           "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset w-fit whitespace-nowrap",
                           getStatusColor(client.bono_estado)
                         )}>
                           {client.bono_tipo ? `Bono ${client.bono_tipo}: ` : ''}{getStatusLabel(client.bono_estado)}
                         </span>
                       </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2 text-gray-700">
                    {client.bonos_historial && client.bonos_historial.length > 0 ? (
                       client.bonos_historial.map((bono, idx) => (
                          <div key={`venc-${bono.id || idx}`} className="flex h-6 items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm whitespace-nowrap">{formatDate(bono.fecha_vencimiento)}</span>
                          </div>
                       ))
                    ) : (
                        <div className="flex h-6 items-center gap-2">
                           <CalendarIcon className="h-4 w-4 text-gray-400" />
                           <span className="text-sm whitespace-nowrap">{formatDate(client.bono_fecha_vencimiento)}</span>
                        </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => onEdit(client)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-primary/5 hover:text-primary transition-colors"
                        title="Editar Cliente"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(client.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Eliminar Cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron clientes que coincidan con tu búsqueda.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
     {/* Pagination could go here */}
      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando <span className="font-medium text-gray-900">{clients.length}</span> resultados</span>
          <div className="flex gap-2">
              <button disabled className="px-3 py-1 rounded border border-gray-200 opacity-50 cursor-not-allowed bg-gray-50">Anterior</button>
              <button disabled className="px-3 py-1 rounded border border-gray-200 opacity-50 cursor-not-allowed bg-gray-50">Siguiente</button>
          </div>
      </div>
    </div>
  );
};

export default ClientTable;
