'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { KanbanBoard } from '@/components/kanban-board';
import { KanbanViewType, Quest } from '@/types';
import {
  Calendar,
  ListChecks,
  Star,
  FolderOpen,
  Search,
  ChevronRight,
  Radar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadarViewDialog } from '@/components/radar-view-dialog';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

interface QuestBoardClientProps {
  initialQuests: Quest[];
}

function QuestBoardContent({ initialQuests }: QuestBoardClientProps) {
  // Selective store subscriptions for better performance
  const kanbanView = useCommandOpsStore(state => state.kanbanView);
  const setKanbanView = useCommandOpsStore(state => state.setKanbanView);
  const setQuests = useCommandOpsStore(state => state.setQuests);
  const missions = useCommandOpsStore(state => state.missions);
  const quests = useCommandOpsStore(state => state.quests);

  // URL parameters
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state for mission filter
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  );
  const [missionSearchTerm, setMissionSearchTerm] = useState('');
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [radarViewOpen, setRadarViewOpen] = useState(false);

  // Set initial data to store
  useEffect(() => {
    try {
      setQuests(initialQuests);
    } catch (error) {
      showEnhancedErrorToast(error, {
        context: 'Quest Data Initialization',
      });
    }
  }, [initialQuests, setQuests]);

  // Memoize URL parameter parsing
  const urlParams = useMemo(
    () => ({
      filter: searchParams.get('filter'),
      missionId: searchParams.get('mission-id'),
    }),
    [searchParams]
  );

  // Sync URL parameters with state
  useEffect(() => {
    try {
      const { filter, missionId } = urlParams;

      if (filter === 'mission' && missionId) {
        setKanbanView('mission');
        setSelectedMissionId(missionId);
      } else if (filter === 'deadline') {
        setKanbanView('deadline');
        setSelectedMissionId(null);
      } else if (filter === 'critical') {
        setKanbanView('critical');
        setSelectedMissionId(null);
      } else {
        // Default to 'all' view
        setKanbanView('all');
        setSelectedMissionId(null);
      }
    } catch (error) {
      console.error('Error syncing URL parameters:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Board Navigation',
      });
    }
  }, [urlParams, setKanbanView]);

  // Filter missions based on search term
  const filteredMissions = useMemo(() => {
    try {
      return (missions || []).filter(mission =>
        mission.title.toLowerCase().includes(missionSearchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error filtering missions:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Filtering',
      });
      return [];
    }
  }, [missions, missionSearchTerm]);

  // Handle mission selection
  const handleMissionSelect = (missionId: string | null) => {
    try {
      setSelectedMissionId(missionId);
      setKanbanView('mission');
      setMainDropdownOpen(false);
      setMissionSearchTerm('');

      // Update URL
      const params = new URLSearchParams();
      params.set('filter', 'mission');
      if (missionId) {
        params.set('mission-id', missionId);
      }
      router.push(`/dashboard?${params.toString()}`);
    } catch (error) {
      console.error('Error selecting mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Selection',
      });
    }
  };

  // Handle view change
  const handleViewChange = (value: KanbanViewType) => {
    try {
      if (value !== 'mission') {
        setSelectedMissionId(null);
      }
      setKanbanView(value);
      setMainDropdownOpen(false);

      // Update URL
      if (value === 'all') {
        router.push('/dashboard');
      } else {
        const params = new URLSearchParams();
        params.set('filter', value);
        router.push(`/dashboard?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error changing view:', error);
      showEnhancedErrorToast(error, {
        context: 'View Change',
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
        <h2 className="text-sm text-primary-text uppercase tracking-wider">
          Quest Log
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setRadarViewOpen(true)}
            className="h-9 px-3"
            style={{
              backgroundColor: 'var(--color-input-bg)',
              borderColor: 'var(--color-input-border)',
              borderRadius: 'var(--border-radius-md, 0.375rem)',
            }}
          >
            <Radar className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">RADAR VIEW</span>
          </Button>

          <DropdownMenu
            open={mainDropdownOpen}
            onOpenChange={setMainDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] sm:w-[200px] justify-between h-9 px-3"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  borderColor: 'var(--color-input-border)',
                  borderRadius: 'var(--border-radius-md, 0.375rem)',
                }}
              >
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  {kanbanView === 'all' && (
                    <>
                      <ListChecks className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">All Quests</span>
                    </>
                  )}
                  {kanbanView === 'deadline' && (
                    <>
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">By Deadline</span>
                    </>
                  )}
                  {kanbanView === 'critical' && (
                    <>
                      <Star className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Critical Ops</span>
                    </>
                  )}
                  {kanbanView === 'mission' && (
                    <>
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {selectedMissionId
                          ? (missions || []).find(
                              m => m.id === selectedMissionId
                            )?.title || 'By Mission'
                          : 'Standalone Operations'}
                      </span>
                    </>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => handleViewChange('all')}>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  All Quests
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange('deadline')}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  By Deadline
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange('critical')}>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Critical Ops
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    By Mission
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-64 max-h-96 overflow-y-auto bg-primary border-border">
                  {/* Search Input */}
                  <div
                    className="p-2 border-b"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search missions..."
                        value={missionSearchTerm}
                        onChange={e => setMissionSearchTerm(e.target.value)}
                        onKeyDown={e => e.stopPropagation()}
                        onFocus={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {/* Standalone Operations */}
                  <DropdownMenuItem
                    onClick={() => handleMissionSelect(null)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Standalone Operations
                    </div>
                  </DropdownMenuItem>

                  {filteredMissions.length > 0 && <DropdownMenuSeparator />}

                  {/* Mission List */}
                  {(filteredMissions || []).map(mission => (
                    <DropdownMenuItem
                      key={mission.id}
                      onClick={() => handleMissionSelect(mission.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{mission.title}</div>
                          {mission.objective && (
                            <div className="text-sm text-gray-400 truncate">
                              {mission.objective}
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  {filteredMissions.length === 0 && missionSearchTerm && (
                    <DropdownMenuItem disabled>
                      No missions found for &quot;{missionSearchTerm}&quot;
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          view={kanbanView}
          missionId={selectedMissionId || undefined}
        />
      </div>

      {/* Radar View Dialog */}
      <RadarViewDialog
        open={radarViewOpen}
        onOpenChange={setRadarViewOpen}
        quests={quests}
      />
    </div>
  );
}

export const QuestBoardClient = React.memo(function QuestBoardClient({
  initialQuests,
}: QuestBoardClientProps) {
  return (
    <DataErrorBoundary context="quest board">
      <QuestBoardContent initialQuests={initialQuests} />
    </DataErrorBoundary>
  );
});
