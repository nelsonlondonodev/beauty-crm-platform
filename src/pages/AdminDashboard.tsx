import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Store, Activity } from 'lucide-react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStats from '../components/admin/AdminStats';
import TenantTable from '../components/admin/TenantTable';
import { getPlatformStats, getTenantsList, type PlatformStats, type TenantInfo } from '../services/adminService';
import type { AdminStat } from '../components/admin/types';
import { logger } from '../lib/logger';

const AdminDashboard = () => {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, tenantsData] = await Promise.all([
          getPlatformStats(),
          getTenantsList()
        ]);
        setPlatformStats(statsData);
        setTenants(tenantsData);
      } catch (err) {
        logger.error('Error loading admin dashboard data', err, 'AdminDashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats: AdminStat[] = [
    { 
      label: 'Salones Registrados', 
      value: platformStats?.totalSalons.toString() || '0', 
      icon: Store, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Usuarios Totales', 
      value: platformStats?.totalUsers.toString() || '0', 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Suscripciones Activas', 
      value: platformStats?.activeSubscriptions.toString() || '0', 
      icon: LayoutDashboard, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Uptime Sistema', 
      value: platformStats?.systemUptime || '99.9%', 
      icon: Activity, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
