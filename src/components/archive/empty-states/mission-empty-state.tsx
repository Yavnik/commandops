'use client';

import React from 'react';
import { MissionFilters } from '@/types/archive';

interface MissionEmptyStateProps {
  filters: MissionFilters;
  onClearFilters: () => Promise<void>;
  totalUnfilteredCount?: number;
}

export function MissionEmptyState({
  filters,
  onClearFilters,
  totalUnfilteredCount = 0,
}: MissionEmptyStateProps) {
  // Check if any filters are applied
  const hasActiveFilters =
    filters.searchQuery ||
    filters.archivedDateRange.startDate ||
    filters.archivedDateRange.endDate;

  // Determine the appropriate empty state
  if (!hasActiveFilters && totalUnfilteredCount === 0) {
    // No archived missions at all
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-accent/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-2">
            Mission Archive Empty
          </h3>
          <p className="text-secondary-text text-sm max-w-md mx-auto leading-relaxed">
            Your completed missions will appear here once archived. Start by
            creating and completing missions in your Command Ops to build your
            operational history.
          </p>
        </div>

        <div className="bg-card-bg border border-tabs-border rounded-lg p-4 max-w-sm">
          <h4 className="text-primary-text font-medium mb-2 text-sm">
            🎯 Mission Workflow
          </h4>
          <ul className="text-xs text-secondary-text space-y-1 text-left">
            <li>• Create missions with objectives</li>
            <li>• Add quests to your missions</li>
            <li>• Complete and archive missions</li>
            <li>• Review mission history here</li>
          </ul>
        </div>
      </div>
    );
  }

  if (hasActiveFilters) {
    // No results with current filters
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">
            No Matching Missions Found
          </h3>
          <p className="text-secondary-text text-sm max-w-md mx-auto leading-relaxed">
            Your search didn&apos;t return any missions. Try adjusting your
            filters or search terms.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClearFilters}
            className="bg-primary-accent hover:bg-primary-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>

          <div className="bg-card-bg border border-tabs-border rounded-lg p-4 max-w-sm">
            <h4 className="text-primary-text font-medium mb-2 text-sm">
              🔍 Search Tips
            </h4>
            <ul className="text-xs text-secondary-text space-y-1 text-left">
              <li>• Try broader date ranges</li>
              <li>• Search mission titles or objectives</li>
              <li>• Use partial keywords</li>
              <li>• Check archival date filters</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Fallback empty state
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-tabs-border flex items-center justify-center">
        <svg
          className="w-6 h-6 text-secondary-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-primary-text mb-2">
        No Missions Available
      </h3>
      <p className="text-secondary-text text-sm max-w-md mx-auto">
        There are no archived missions to display at this time.
      </p>
    </div>
  );
}
