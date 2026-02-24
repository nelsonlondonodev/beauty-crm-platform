import React from 'react';
import { Calendar, User, DollarSign, CheckCircle } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'appointment',
    title: 'Nueva Cita',
    description: 'María Gómez reservó para Corte y Secado',
    time: 'Hace 5 min',
    icon: Calendar,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 2,
    type: 'client',
    title: 'Nuevo Cliente',
    description: 'Juan Pérez se unió al programa de fidelización',
    time: 'Hace 1 hora',
    icon: User,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    id: 3,
    type: 'sale',
    title: 'Venta Realizada',
    description: 'Factura #1024 pagada con éxito',
    time: 'Hace 2 horas',
    icon: DollarSign,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    id: 4,
    type: 'bonus',
    title: 'Bono Canjeado',
    description: 'Ana López canjeó su bono de cumpleaños',
    time: 'Ayer',
    icon: CheckCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

const RecentActivity: React.FC = () => {
  return (
    <div className="col-span-full lg:col-span-3 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Timeline Connector */}
              {index !== activities.length - 1 && (
                <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-px bg-gray-200"></div>
              )}
              
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.bg} ring-8 ring-white`}
              >
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              
              <div className="flex flex-1 flex-col pt-1.5 pb-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <span className="whitespace-nowrap text-xs text-gray-500 ml-4 font-medium px-2.5 py-0.5 rounded-full bg-gray-50 border border-gray-100 shrink-0">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 rounded-lg hover:bg-primary/5">
          Ver toda la actividad
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
