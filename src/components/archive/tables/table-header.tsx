'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';

interface TableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortKey: string) => void;
  sortable?: boolean;
  className?: string;
}

export function TableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  sortable = true,
  className = '',
}: TableHeaderProps) {
  const isCurrentSort = currentSortBy === sortKey;
  const isAsc = isCurrentSort && currentSortOrder === 'asc';
  const isDesc = isCurrentSort && currentSortOrder === 'desc';

  const handleClick = () => {
    if (sortable) {
      onSort(sortKey);
    }
  };

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider ${
        sortable ? 'cursor-pointer hover:text-primary-text select-none' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp
              className={`h-3 w-3 ${
                isAsc ? 'text-primary-text' : 'text-tabs-border'
              }`}
            />
            <ChevronDown
              className={`h-3 w-3 -mt-1 ${
                isDesc ? 'text-primary-text' : 'text-tabs-border'
              }`}
            />
          </div>
        )}
      </div>
    </th>
  );
}
