'use client';

import React, { useEffect } from 'react';
import { useArchiveStore } from '@/store/archive-store';
import { useSearchParams } from 'next/navigation';
import { ArchiveHeader } from './archive-header';
import { ViewToggle } from './view-toggle';
import { ContextualFilters } from './filters';
import { ArchiveTable } from './archive-table';
import { PaginationControls } from './pagination-controls';
import { FilterLoading } from './loading-states';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

function ArchiveLayoutContent() {
  const {
    currentView,
    questPagination,
    missionPagination,
    isLoading,
    syncFromURL,
    goToQuestPage,
    goToMissionPage,
    changeQuestPageSize,
    changeMissionPageSize,
  } = useArchiveStore();

  const searchParams = useSearchParams();

  // Sync state from URL on mount
  useEffect(() => {
    try {
      syncFromURL(searchParams);
    } catch (error) {
      console.error('Error syncing archive from URL:', error);
      showEnhancedErrorToast(error, {
        context: 'Archive URL Sync',
      });
    }
  }, [syncFromURL, searchParams]);

  // Fetch initial data after URL sync (only if no data exists)
  useEffect(() => {
    try {
      const { questsData, missionsData, fetchQuestsData, fetchMissionsData } =
        useArchiveStore.getState();

      if (currentView === 'quests' && questsData.length === 0) {
        fetchQuestsData();
      } else if (currentView === 'missions' && missionsData.length === 0) {
        fetchMissionsData();
      }
    } catch (error) {
      console.error('Error fetching initial archive data:', error);
      showEnhancedErrorToast(error, {
        context: 'Archive Data Fetch',
      });
    }
  }, [currentView]); // Trigger when currentView changes (including from URL sync)

  // Calculate total count based on current view
  const totalCount =
    currentView === 'quests'
      ? questPagination.totalCount
      : missionPagination.totalCount;

  // Get current pagination data
  const currentPagination =
    currentView === 'quests' ? questPagination : missionPagination;

  // Handle pagination
  const handlePageChange = (page: number) => {
    try {
      if (currentView === 'quests') {
        goToQuestPage(page);
      } else {
        goToMissionPage(page);
      }
    } catch (error) {
      console.error('Error changing archive page:', error);
      showEnhancedErrorToast(error, {
        context: 'Archive Pagination',
      });
    }
  };

  const handlePageSizeChange = (pageSize: number) => {
    try {
      if (currentView === 'quests') {
        changeQuestPageSize(pageSize);
      } else {
        changeMissionPageSize(pageSize);
      }
    } catch (error) {
      console.error('Error changing archive page size:', error);
      showEnhancedErrorToast(error, {
        context: 'Archive Page Size',
      });
    }
  };

  return (
    <div className="space-y-6">
      <ArchiveHeader totalCount={totalCount} viewMode={currentView} />

      <ViewToggle />

      <ContextualFilters />

      {/* Show filter loading overlay during filter application */}
      <div className="relative">
        <ArchiveTable />
        {isLoading[currentView] && (
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
            <FilterLoading
              variant={currentView === 'quests' ? 'quest' : 'mission'}
            />
          </div>
        )}
      </div>

      {totalCount > 0 && !isLoading[currentView] && (
        <PaginationControls
          currentPage={currentPagination.page}
          totalPages={currentPagination.totalPages}
          pageSize={currentPagination.pageSize}
          totalCount={currentPagination.totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading[currentView]}
        />
      )}
    </div>
  );
}

export const ArchiveLayout = React.memo(function ArchiveLayout() {
  return (
    <DataErrorBoundary context="archive layout">
      <ArchiveLayoutContent />
    </DataErrorBoundary>
  );
});
