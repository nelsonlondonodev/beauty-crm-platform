import { User } from 'lucide-react';
import type { Client } from '../../../types';
import { cn } from '../../../lib/utils';
import { formatDate, getStatusColor, getStatusLabel } from '../../../lib/formatters';

interface ProfileLoyaltyStatusProps {
  client: Client;
  topServices: [string, number][];
}

const ProfileLoyaltyStatus = ({ client, topServices }: ProfileLoyaltyStatusProps) => {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-center text-lg font-semibold text-gray-900">
        <User className="text-primary mr-2 h-5 w-5" />
        Estado de Fidelización
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <article className="space-y-4">
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
        </article>
        
        <article className="space-y-4">
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
        </article>
      </div>
    </section>
  );
};

export default ProfileLoyaltyStatus;
