import { useState } from 'react';
import { Users } from 'lucide-react';
import type { Empleado } from '../../types';
import { cn } from '../../lib/utils';
import { getStaffColor } from './staffColors';

// ── Types ───────────────────────────────────────────────────────────────────

interface StaffFilterProps {
  staff: Empleado[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

const StaffFilter = ({ staff, selectedIds, onSelectionChange }: StaffFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeStaff = staff.filter((s) => s.activo);
  const allSelected = selectedIds.length === activeStaff.length;

  const toggleStaff = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      // Don't allow deselecting if it's the last one
      if (selectedIds.length <= 1) return;
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      // Select only the first staff member
      if (activeStaff.length > 0) {
        onSelectionChange([activeStaff[0].id]);
      }
    } else {
      onSelectionChange(activeStaff.map((s) => s.id));
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>Colaboradores</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {selectedIds.length}/{activeStaff.length}
          </span>
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Filter List */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          {/* Select All */}
          <button
            onClick={toggleAll}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              allSelected
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <div className={cn(
              'h-3 w-3 rounded-sm border',
              allSelected
                ? 'bg-primary border-primary'
                : 'border-gray-300'
            )} />
            Todos
          </button>

          {/* Individual Staff */}
          {activeStaff.map((member, index) => {
            const isSelected = selectedIds.includes(member.id);
            const color = getStaffColor(index);

            return (
              <button
                key={member.id}
                onClick={() => toggleStaff(member.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  isSelected
                    ? `${color.bg} ${color.text} ring-1 ${color.ring}`
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'h-2.5 w-2.5 rounded-full transition-opacity',
                  color.dot,
                  !isSelected && 'opacity-30'
                )} />
                <span className="truncate">{member.nombre}</span>
                <span className="ml-auto text-[10px] opacity-60">{member.rol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffFilter;
