import type { LucideIcon } from 'lucide-react';

export interface AdminStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface Tenant {
  id: number;
  name: string;
  owner: string;
  status: string;
  plan: string;
}
