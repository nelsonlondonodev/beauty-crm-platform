import { LayoutDashboard, Users, Store, Activity } from 'lucide-react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStats from '../components/admin/AdminStats';
import TenantTable from '../components/admin/TenantTable';
import type { AdminStat, Tenant } from '../components/admin/types';

const AdminDashboard = () => {
  const stats: AdminStat[] = [
    { label: 'Salones Registrados', value: '15', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuarios Totales', value: '124', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Suscripciones Activas', value: '12', icon: LayoutDashboard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Uptime Sistema', value: '99.98%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const tenants: Tenant[] = [
    { id: 1, name: "Narbo's Salón Spa", owner: 'Nelson Londoño', status: 'Activo', plan: 'Premium' },
    { id: 2, name: 'Barbería El Estilo', owner: 'Juan Pérez', status: 'Activo', plan: 'Básico' },
    { id: 3, name: 'Santuario Spa', owner: 'Maria Garcia', status: 'Pendiente', plan: 'Trial' },
  ];

  return (
    <div className="space-y-6 p-6">
      <AdminHeader 
        title="Centro de Mando Global" 
        subtitle="Monitoreo de plataforma y gestión de inquilinos (Tenants)." 
        onRegisterNew={() => console.log('Registrar nuevo salón')}
      />

      <AdminStats stats={stats} />

      <TenantTable 
        tenants={tenants} 
        onManage={(tenant) => console.log('Gestionar tenant:', tenant)}
        onViewAll={() => console.log('Ver todos')}
      />
    </div>
  );
};

export default AdminDashboard;
