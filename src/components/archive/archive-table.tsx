'use client';

import React, { useState } from 'react';
import { useArchiveStore } from '@/store/archive-store';
import { ArchiveQuest, ArchiveMission } from '@/types/archive';
import { QuestLogTable } from './tables/quest-log-table';
import { MissionHistoryTable } from './tables/mission-history-table';
import { ShimmerTableLoading } from './loading-states';
import { IntelDossierModal, MissionAfterActionModal } from './modals';
import { QuestEmptyState, MissionEmptyState } from './empty-states';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

export const ArchiveTable = React.memo(function ArchiveTable() {
  const [selectedQuest, setSelectedQuest] = useState<ArchiveQuest | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);

  const {
    currentView,
    questsData,
    missionsData,
    questFilters,
    missionFilters,
    questSorting,
    missionSorting,
    isLoading,
    errors,
    missionModalOpen,
    selectedMissionDetails,
    sortQuests,
    sortMissions,
    setCurrentView,
    setQuestFilters,
    applyQuestFilters,
    setSelectedMissionTitle,
    openMissionModal,
    closeMissionModal,
    clearQuestFilters,
    clearMissionFilters,
  } = useArchiveStore();

  const isCurrentlyLoading = isLoading[currentView];
  const currentError = errors[currentView];

  // Handle sorting for current view
  const handleSort = (sortKey: string) => {
    try {
      if (currentView === 'quests') {
        sortQuests(sortKey);
      } else {
        sortMissions(sortKey);
      }
    } catch (error) {
      console.error('Error sorting archive data:', error);
      showEnhancedErrorToast(error, {
        context: 'Archive Sorting',
      });
    }
  };

  // Handle quest click to open Intel Dossier modal
  const handleQuestClick = (quest: ArchiveQuest) => {
    try {
      setSelectedQuest(quest);
      setIsQuestModalOpen(true);
    } catch (error) {
      console.error('Error opening quest details:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Details',
      });
    }
  };

  // Handle mission click to open After Action Report modal
  const handleMissionClick = (mission: ArchiveMission) => {
    try {
      openMissionModal(mission.id);
    } catch (error) {
      console.error('Error opening mission details:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Details',
      });
    }
  };

  // Handle view quests button click
  const handleViewQuests = async (missionId: string, missionTitle: string) => {
    try {
      // Switch to quest view
      setCurrentView('quests');

      // Store the mission title for immediate display
      setSelectedMissionTitle(missionTitle);

      // Set the mission filter to show only quests from this mission
      setQuestFilters({
        missionIds: [missionId],
        searchQuery: '', // Clear other filters to focus on this mission
        dateRange: { startDate: null, endDate: null },
        satisfactionLevels: [],
        showCriticalOnly: false,
      });

      // Apply the filters to fetch the data
      await applyQuestFilters();
    } catch (error) {
      console.error('Error filtering quests by mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Quest Filter',
      });
    }
  };

  // Error state
  if (currentError) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-400 mb-2">
            Error Loading Data
          </p>
          <p className="text-sm text-red-300">{currentError}</p>
          <button
            onClick={() => {
              if (currentView === 'quests') {
                useArchiveStore.getState().fetchQuestsData();
              } else {
                useArchiveStore.getState().fetchMissionsData();
              }
            }}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCurrentlyLoading) {
    return (
      <div className="bg-tabs-bg border border-tabs-border rounded-lg p-4">
        <ShimmerTableLoading
          variant={currentView === 'quests' ? 'quest' : 'mission'}
          rows={5}
        />
      </div>
    );
  }

  // Check for empty states
  const showQuestEmptyState =
    currentView === 'quests' && questsData.length === 0;
  const showMissionEmptyState =
    currentView === 'missions' && missionsData.length === 0;

  // Main table content
  return (
    <>
      {showQuestEmptyState ? (
        <QuestEmptyState
          filters={questFilters}
          onClearFilters={clearQuestFilters}
          totalUnfilteredCount={0} // TODO: We'd need to track this separately
        />
      ) : showMissionEmptyState ? (
        <MissionEmptyState
          filters={missionFilters}
          onClearFilters={clearMissionFilters}
          totalUnfilteredCount={0} // TODO: We'd need to track this separately
        />
      ) : (
        <div className="bg-tabs-bg border border-tabs-border rounded-lg overflow-hidden">
          {currentView === 'quests' ? (
            <QuestLogTable
              quests={questsData}
              currentSortBy={questSorting.sortBy}
              currentSortOrder={questSorting.sortOrder}
              onSort={handleSort}
              onQuestClick={handleQuestClick}
            />
          ) : (
            <MissionHistoryTable
              missions={missionsData}
              currentSortBy={missionSorting.sortBy}
              currentSortOrder={missionSorting.sortOrder}
              onSort={handleSort}
              onMissionClick={handleMissionClick}
              onViewQuests={handleViewQuests}
            />
          )}
        </div>
      )}

      {/* Intel Dossier Modal */}
      <IntelDossierModal
        quest={selectedQuest}
        open={isQuestModalOpen}
        onOpenChange={setIsQuestModalOpen}
      />

      {/* Mission After Action Report Modal */}
      <MissionAfterActionModal
        mission={selectedMissionDetails}
        open={missionModalOpen}
        onOpenChange={closeMissionModal}
        isLoading={isLoading.missionDetails}
      />
    </>
  );
});
