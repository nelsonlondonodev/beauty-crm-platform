import type { Tenant } from './types';

interface TenantTableProps {
  tenants: Tenant[];
  onManage?: (tenant: Tenant) => void;
  onViewAll?: () => void;
}

const TenantTable = ({ tenants, onManage, onViewAll }: TenantTableProps) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Configuración de Salones</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Razón Social / Marca</th>
              <th className="px-6 py-3">ID Propietario (Tenant)</th>
              <th className="px-6 py-3">Suscripción</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Configuración</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-gray-500">{tenant.id}</td>
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
                <td 
                  className="whitespace-nowrap px-6 py-4 text-right capitalize text-primary font-medium cursor-pointer hover:underline"
                  onClick={() => onManage?.(tenant)}
                >
                  Configurar
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 text-center">
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
