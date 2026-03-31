import { Mail, Phone, Calendar } from 'lucide-react';
import type { Client } from '../../../types';
import { formatDate } from '../../../lib/formatters';

interface ClientInfoCardProps {
  client: Client;
}

const ClientInfoCard = ({ client }: ClientInfoCardProps) => {
  return (
    <aside className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <header className="flex flex-col items-center border-b border-gray-100 p-6 text-center">
        <div className="bg-primary/10 text-primary mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold shadow-sm">
          {client.nombre.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{client.nombre}</h2>
        <p className="text-sm text-gray-500">Cliente Registrado</p>
      </header>
      
      <div className="p-6">
        <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Información de Contacto
        </h3>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate" title={client.email || ''}>
                {client.email || 'Sin correo electrónico'}
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {client.telefono || 'Sin teléfono'}
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {client.fecha_nacimiento ? formatDate(client.fecha_nacimiento) : 'No registra cumpleaños'}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default ClientInfoCard;
