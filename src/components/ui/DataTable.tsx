import type { ReactNode } from 'react';
import type { DataTableProps } from '../../types/table';
import { Loader2 } from 'lucide-react';

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No hay datos disponibles.',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={`flex w-full min-h-[200px] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-gray-50/80 text-xs font-semibold uppercase text-gray-700">
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col" className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors hover:bg-gray-50/60 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.cell
                      ? col.cell(item, index)
                      : col.accessorKey
                      ? (item[col.accessorKey] as ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
