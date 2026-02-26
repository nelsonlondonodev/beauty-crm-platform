import React from 'react';
import { Calendar, User, DollarSign, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ActivityItem } from '../../services/dashboardService';

interface RecentActivityProps {
  data?: ActivityItem[];
}

const getActivityVisuals = (type: string) => {
  switch (type) {
    case 'appointment':
      return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'client':
      return { icon: User, color: 'text-green-500', bg: 'bg-green-50' };
    case 'sale':
      return { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' };
    case 'bonus':
      return {
        icon: CheckCircle,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
      };
    default:
      return { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const RecentActivity: React.FC<RecentActivityProps> = ({ data = [] }) => {
  return (
    <div className="col-span-full flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Actividad Reciente
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {data.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            No hay actividad reciente en el sistema.
          </p>
        ) : (
          <div className="space-y-6">
            {data.map((activity, index) => {
              const visuals = getActivityVisuals(activity.type);

              // Evitar bloqueos si timestamp viene inválido
              let relativeTime = 'Fechas no disponibles';
              try {
                if (activity.timestamp) {
                  relativeTime = formatDistanceToNow(
                    new Date(activity.timestamp),
                    {
                      addSuffix: true,
                      locale: es,
                    }
                  );
                }
              } catch (err) {
                console.error('Error formatting date', err);
              }

              return (
                <div key={activity.id} className="relative mt-2 flex gap-4">
                  {/* Timeline Connector */}
                  {index !== data.length - 1 && (
                    <div className="absolute top-10 bottom-[-1.5rem] left-[1.125rem] w-px bg-gray-200"></div>
                  )}

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${visuals.bg} relative z-10 ring-8 ring-white`}
                  >
                    <visuals.icon className={`h-4 w-4 ${visuals.color}`} />
                  </div>

                  <div className="flex flex-1 flex-col pt-1.5 pb-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <span className="ml-4 shrink-0 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-gray-500 capitalize">
                        {relativeTime}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="text-primary hover:text-primary/80 hover:bg-primary/5 w-full rounded-lg py-2 text-center text-sm font-medium transition-colors">
          Ver toda la actividad
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
