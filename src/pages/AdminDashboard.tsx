import { LayoutDashboard, Users, Store, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Salones Registrados', value: '15', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuarios Totales', value: '124', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Suscripciones Activas', value: '12', icon: LayoutDashboard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Uptime Sistema', value: '99.98%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const tenants = [
    { id: 1, name: "Narbo's Salón Spa", owner: 'Nelson Londoño', status: 'Activo', plan: 'Premium' },
    { id: 2, name: 'Barbería El Estilo', owner: 'Juan Pérez', status: 'Activo', plan: 'Básico' },
    { id: 3, name: 'Santuario Spa', owner: 'Maria Garcia', status: 'Pendiente', plan: 'Trial' },
  ];

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Mando Global</h1>
          <p className="text-gray-500 text-sm">Monitoreo de plataforma y gestión de inquilinos (Tenants).</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors">
          <Store className="h-4 w-4" />
          Registrar Nuevo Salón
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Salones / Tenants */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Salones Registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Nombre del Salón</th>
                <th className="px-6 py-3">Propietario</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">{tenant.owner}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      tenant.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right capitalize text-primary font-medium cursor-pointer hover:underline">
                    Gestionar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 text-center">
          <button className="text-sm font-medium text-primary hover:underline">
            Ver todos los salones registrados
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
