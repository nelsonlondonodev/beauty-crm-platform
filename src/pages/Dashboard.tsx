import React from 'react';
import { Users, Calendar, Gift, Award, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {
  // Mock data - replace with data from useClients() hook later
  const stats = [
    {
      label: 'Clientes Totales',
      value: '1,234',
      trend: '+12%',
      color: 'text-purple-600',
      icon: Users,
    },
    {
      label: 'Citas Hoy',
      value: '42',
      trend: '+5%',
      color: 'text-pink-600',
      icon: Calendar,
    },
    {
      label: 'Cumpleaños (Mes)',
      value: '23',
      color: 'text-orange-500',
      icon: Gift,
    },
    {
      label: 'Bonos Activos',
      value: '856',
      trend: '+8%',
      color: 'text-green-600',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Bienvenido de nuevo, Nelson. Aquí está lo que sucede hoy en tu negocio.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <TrendingUp className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
            Ver Reportes
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            + Nueva Cita
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Citas de Hoy</h3>
            <button className="text-sm font-medium text-primary hover:text-primary/80">Ver todas</button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {10 + i}:00
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Maria Fernanda</p>
                      <p className="text-sm text-gray-500">Corte y Color</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Confirmada</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Alertas de Bonos</h3>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">5</span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-red-50 bg-red-50/30 p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bono por vencer: Juan Perez</p>
                    <p className="text-xs text-gray-500">Vence en 5 días - Enviar recordatorio</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 rounded-lg border border-yellow-50 bg-yellow-50/30 p-3">
                  <Gift className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cumpleaños Mañana: Sofia L.</p>
                    <p className="text-xs text-gray-500">Descuento del 15% activo</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
