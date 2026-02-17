import type { BonusStatus } from './index';

export interface ClientFilters {
  searchTerm: string;
  status: BonusStatus | 'all';
}

export type SortField = 'nombre' | 'fecha_nacimiento' | 'bono_fecha_vencimiento';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
