import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  color?: string; // e.g. 'text-blue-500'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon: Icon, color = 'text-primary' }) => {
  return (
    <div className="flex h-[130px] w-full flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color.replace('text-', 'bg-')}/10 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <p className="flex items-center text-xs font-medium text-green-600">
          <span className="mr-1">↑</span>
          {trend} vs mes anterior
        </p>
      )}
    </div>
  );
};

export default StatCard;
