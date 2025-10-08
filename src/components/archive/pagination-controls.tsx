'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(parseInt(value, 10));
  };

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Results info */}
      <div className="text-sm text-secondary-text">
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
        {totalCount.toLocaleString()} results
      </div>

      {/* Page size selector and navigation */}
      <div className="flex items-center space-x-6">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-text">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-text">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center space-x-1">
            {/* First page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Next page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
