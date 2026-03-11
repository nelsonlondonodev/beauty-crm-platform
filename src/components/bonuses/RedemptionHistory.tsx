import { useState, useEffect, useCallback } from 'react';
import { getRedeemedBonos, type ValidatedBono, type RedemptionsFilter } from '../../services/bonoService';
import { Filter, Calendar, Tag, RefreshCw, ChevronRight, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { CRM_EVENTS } from '../../lib/events';

const RedemptionHistory = () => {
  const [history, setHistory] = useState<ValidatedBono[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RedemptionsFilter>({
    periodo: 'hoy',
    tipo: 'Todos',
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRedeemedBonos(filters);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Escuchar eventos de nuevos canjes para refrescar la lista
  useEffect(() => {
    const handleBonoRedeemed = () => {
      fetchHistory();
    };

    window.addEventListener(CRM_EVENTS.BONO_REDEEMED, handleBonoRedeemed);
    return () => {
      window.removeEventListener(CRM_EVENTS.BONO_REDEEMED, handleBonoRedeemed);
    };
  }, [fetchHistory]);

  const getCampaignStyles = (tipo: string) => {
    switch (tipo) {
      case 'Bienvenida':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cumpleaños':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Reactivacion':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Auditoría de Canjes
          </h3>
          <p className="text-sm text-gray-500 font-medium">Historial reciente para control de caja y campañas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Periodo */}
          <div className="relative">
            <select
              value={filters.periodo}
              onChange={(e) => setFilters(prev => ({ ...prev, periodo: e.target.value as RedemptionsFilter['periodo'] }))}
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="año">Este Año</option>
              <option value="todo">Histórico</option>
            </select>
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Selector de Campaña */}
          <div className="relative">
            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="Todos">Todas las Campañas</option>
              <option value="Bienvenida">Bienvenida</option>
              <option value="Cumpleaños">Cumpleaños</option>
              <option value="Reactivacion">Reactivación</option>
              <option value="Especial">Especial</option>
            </select>
            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchHistory()}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
            title="Refrescar"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Tabla / Lista de Resultados */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        {loading && history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4">
               <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-indigo-200" />
               </div>
            </div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Cargando auditoría de datos...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
               <Filter className="h-10 w-10 text-gray-200" />
            </div>
            <h4 className="text-gray-900 font-bold text-lg">Sin canjes registrados</h4>
            <p className="text-gray-500 text-sm mt-1 max-w-xs font-medium">
              No hay registros que coincidan con los filtros seleccionados para este periodo.
            </p>
          </div>
        ) : (
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Campaña</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Fecha / Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right">Código</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((bono) => (
                  <tr key={bono.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {bono.clientes_fidelizacion?.nombre?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-indigo-900 transition-colors uppercase tracking-tight text-sm">
                          {bono.clientes_fidelizacion?.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest",
                        getCampaignStyles(bono.tipo)
                      )}>
                        {bono.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bono.fecha_canje ? (
                        <div className="flex flex-col">
                          <span className="capitalize font-bold text-gray-800 tracking-tight">
                            {format(new Date(bono.fecha_canje), 'eeee, d MMM', { locale: es })}
                          </span>
                          <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">
                            {format(new Date(bono.fecha_canje), 'hh:mm a')}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-mono text-xs font-black text-gray-300 group-hover:text-indigo-600 transition-all bg-gray-50 px-2 py-1 rounded group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100">
                        {bono.codigo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest">
                Resumen de Caja: <span className="text-gray-900">{history.length}</span> {history.length === 1 ? 'canje' : 'canjes'}
              </span>
           </div>
           <button 
             className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-all hover:translate-x-1"
             onClick={() => window.print()}
           >
             Cerrar caja (Imp)
             <ChevronRight className="h-3 w-3" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default RedemptionHistory;
