import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import { getFacturasByEmpleado } from '../services/billingService';
import type { FacturaItemWithRelations } from '../types';
import { formatDate } from '../lib/formatters';
import { Loader2, ArrowLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const StaffSales = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sales, setSales] = useState<FacturaItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      if (!id) return;
      try {
        const data = await getFacturasByEmpleado(id);
        setSales(data);
      } catch {
        toast.error('Error al cargar el historial del colaborador');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [id]);

  const totalCommission = sales.reduce((acc, sale) => acc + (sale.comision_monto || 0), 0);
  const totalSales = sales.reduce((acc, sale) => acc + (sale.precio_total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/staff')}
          className="hover:bg-primary/5 hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <DashboardHeader 
          title="Historial del Colaborador" 
          subtitle="Consulta el detalle de todos los servicios realizados por este integrante."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ventas Totales Generadas</p>
            <p className="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Comisiones Acumuladas</p>
            <p className="text-2xl font-bold text-gray-900">${totalCommission.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50/50 text-xs text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Servicio</th>
                  <th className="px-6 py-4 font-semibold text-right">Precio</th>
                  <th className="px-6 py-4 font-semibold text-right text-blue-600">Comisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatDate(sale.created_at ?? '')}
                    </td>
                    <td className="px-6 py-4">
                      {sale.facturas?.clientes_fidelizacion?.nombre || 'Consumidor Final'}
                    </td>
                    <td className="px-6 py-4">
                      {sale.descripcion}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${sale.precio_total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      ${sale.comision_monto?.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay registros de servicios para este colaborador.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSales;
