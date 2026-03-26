import type { Tenant } from './types';
import { DataTable } from '../ui/DataTable';
import type { ColumnDef } from '../../types/table';

interface TenantTableProps {
  tenants: Tenant[];
  onManage?: (tenant: Tenant) => void;
  onViewAll?: () => void;
}

const TenantTable = ({ tenants, onManage, onViewAll }: TenantTableProps) => {
  const columns: ColumnDef<Tenant>[] = [
    {
      header: 'Razón Social / Marca',
      className: 'font-medium text-gray-900',
      cell: (tenant) => tenant.name,
    },
    {
      header: 'ID Propietario (Tenant)',
      className: 'text-xs font-mono text-gray-500',
      cell: (tenant) => tenant.id,
    },
    {
      header: 'Suscripción',
      cell: (tenant) => (
        <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          {tenant.plan}
        </span>
      ),
    },
    {
      header: 'Estado',
      cell: (tenant) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          tenant.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {tenant.status}
        </span>
      ),
    },
    {
      header: 'Configuración',
      className: 'text-right capitalize text-primary font-medium cursor-pointer hover:underline',
      cell: (tenant) => (
        <button onClick={() => onManage?.(tenant)} className="w-full text-right outline-none">
          Configurar
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Configuración de Salones</h2>
      </div>
      
      <DataTable<Tenant>
        data={tenants}
        columns={columns}
        keyExtractor={(tenant) => tenant.id}
        emptyMessage="No hay salones configurados."
        className="rounded-none border-0 shadow-none border-b border-gray-100"
      />

      <div className="bg-gray-50/50 px-6 py-4 text-center">
        <button 
          onClick={onViewAll}
          className="text-sm font-medium text-primary hover:underline"
        >
          Administrar todos los inquilinos configurados
        </button>
      </div>
    </div>
  );
};

export default TenantTable;
