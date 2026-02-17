import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'reclamado':
      return 'bg-green-100 text-green-700 ring-green-600/20';
    case 'pendiente':
      return 'bg-blue-50 text-blue-700 ring-blue-700/10';
    case 'vencido':
      return 'bg-red-50 text-red-700 ring-red-600/10';
    case 'alerta_5_meses':
      return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-500/10';
  }
};

export const getStatusLabel = (status: string): string => {
   switch (status) {
    case 'reclamado': return 'Reclamado';
    case 'pendiente': return 'Activo';
    case 'vencido': return 'Vencido';
    case 'alerta_5_meses': return 'Por Vencer';
    default: return status;
  }
}
