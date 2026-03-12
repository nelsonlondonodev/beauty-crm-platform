import { LayoutDashboard, Users, Store, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Salones Totales', value: '12', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuarios Activos', value: '48', icon: Users, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Suscripciones', value: '10', icon: LayoutDashboard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Uptime Sistema', value: '99.9%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Centro de Mando Global</h1>
        <p className="text-gray-500">Gestión de plataforma y multitenancy.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <stat.icon className={`h-6 w-6 ${stat.color || stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder para Lista de Salones */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Salones Registrados</h2>
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
          Módulo de gestión de salones en desarrollo...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
