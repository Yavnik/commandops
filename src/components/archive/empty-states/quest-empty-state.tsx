'use client';

import React from 'react';
import { QuestFilters } from '@/types/archive';

interface QuestEmptyStateProps {
  filters: QuestFilters;
  onClearFilters: () => Promise<void>;
  totalUnfilteredCount?: number;
}

export function QuestEmptyState({
  filters,
  onClearFilters,
  totalUnfilteredCount = 0,
}: QuestEmptyStateProps) {
  // Check if any filters are applied
  const hasActiveFilters =
    filters.searchQuery ||
    filters.dateRange.startDate ||
    filters.dateRange.endDate ||
    filters.missionIds.length > 0 ||
    filters.satisfactionLevels.length > 0 ||
    filters.showCriticalOnly;

  // Determine the appropriate empty state
  if (!hasActiveFilters && totalUnfilteredCount === 0) {
    // No archived quests at all
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-2">
            Mission Log Empty
          </h3>
          <p className="text-secondary-text text-sm max-w-md mx-auto leading-relaxed">
            Your operational history will appear here once you complete and
            archive quests. Start by completing some quests in your Command Ops
            to build your mission log.
          </p>
        </div>

        <div className="bg-card-bg border border-tabs-border rounded-lg p-4 max-w-sm">
          <h4 className="text-primary-text font-medium mb-2 text-sm">
            📋 Getting Started
          </h4>
          <ul className="text-xs text-secondary-text space-y-1 text-left">
            <li>• Complete quests in your Command Ops</li>
            <li>• Archive finished missions</li>
            <li>• Return here to review your progress</li>
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
            No Matching Quests Found
          </h3>
          <p className="text-secondary-text text-sm max-w-md mx-auto leading-relaxed">
            Your search didn&apos;t return any results. Try adjusting your
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
              <li>• Remove mission filters</li>
              <li>• Search for partial keywords</li>
              <li>• Check satisfaction level filters</li>
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-primary-text mb-2">
        No Quests Available
      </h3>
      <p className="text-secondary-text text-sm max-w-md mx-auto">
        There are no archived quests to display at this time.
      </p>
    </div>
  );
}
