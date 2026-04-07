import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    // Simple property accessor for sorting
    const key = sortConfig.key as keyof T;
    const valA = a[key];
    const valB = b[key];

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    
    setSortConfig((current) => {
      if (current?.key === column.accessor) {
        return {
          key: column.accessor,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: column.accessor, direction: 'asc' };
    });
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-warm-300 bg-warm-100 shadow-card', className)}>
      <table className="w-full text-sm text-left">
        <thead className="bg-warm-200 border-b border-warm-300">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'table-header px-6 py-4 text-left',
                  col.sortable && 'cursor-pointer hover:bg-warm-100 transition-colors'
                )}
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center gap-1.5">
                  {col.header}
                  {col.sortable && (
                    <div className="flex flex-col text-text-muted">
                      <ChevronUp
                        className={cn(
                          'w-2.5 h-2.5 -mb-0.5',
                          sortConfig?.key === col.accessor && sortConfig.direction === 'asc'
                            ? 'text-ember-500' : 'text-warm-400'
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'w-2.5 h-2.5 -mt-0.5',
                          sortConfig?.key === col.accessor && sortConfig.direction === 'desc'
                            ? 'text-ember-500' : 'text-warm-400'
                        )}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="bg-warm-50">
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-5 w-full max-w-[200px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-warm-200 hover:bg-[#FFF8F4] transition-colors duration-100',
                  onRowClick && 'cursor-pointer',
                  i % 2 === 0 ? 'bg-warm-100' : 'bg-warm-50'
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-warm-900">
                    {col.render 
                      ? col.render(item) 
                      : String(item[col.accessor as keyof T] ?? '')}
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
