'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quest, KanbanViewType, QuestStatus } from '@/types';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { DeploymentProtocolDialog } from '@/components/deployment-protocol-dialog';
import { EmergencyDeployModal } from '@/components/emergency-deploy-modal';
import { MissionDebriefDialog } from '@/components/mission-debrief-dialog';
import { QuestDetailsModal } from '@/components/quest-details-modal';
import { NewQuestDialog } from '@/components/new-quest-dialog';
import { QuestCard } from '@/components/quest-card';
import { KanbanFilter } from '@/components/kanban-filter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

interface KanbanBoardProps {
  view: KanbanViewType;
  missionId?: string;
}

interface Column {
  id: string;
  title: string;
  status?: QuestStatus;
  quests: Quest[];
}

interface DraggableQuestCardProps {
  quest: Quest;
  view: KanbanViewType;
  isOverlay?: boolean;
  onQuestClick?: (quest: Quest) => void;
  onEnterBattleStation?: (quest: Quest) => void;
}

function DraggableQuestCard({
  quest,
  view,
  isOverlay = false,
  onQuestClick,
  onEnterBattleStation,
}: DraggableQuestCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: quest.id,
      data: {
        type: 'quest',
        quest,
      },
      disabled: quest.status === 'COMPLETED' || view === 'deadline', // Disable dragging for completed quests and deadline view
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(quest.status !== 'COMPLETED' && view !== 'deadline'
        ? listeners
        : {})}
      className={cn(
        isDragging && !isOverlay && 'opacity-50',
        isOverlay && 'scale-105 shadow-2xl',
        !isDragging && 'transition-all duration-200'
      )}
    >
      <QuestCard
        quest={quest}
        view={view}
        onQuestClick={onQuestClick}
        onEnterBattleStation={onEnterBattleStation}
        className={cn(
          isDragging && !isOverlay && 'opacity-50',
          isOverlay && 'scale-105 shadow-2xl'
        )}
      />
    </div>
  );
}

interface DroppableColumnProps {
  column: Column;
  children: React.ReactNode;
}

function DroppableColumn({ column, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  // Check if this is the Active Operations column in danger state (exactly 3 quests)
  const isDangerState =
    column.status === 'ACTIVE' && column.quests.length === 3;

  // Check if Active Operations is at maximum emergency capacity (4 cards)
  const isEmergencyCapacity =
    column.status === 'ACTIVE' && column.quests.length === 4;

  // Determine count badge styling based on content
  const getCountBadgeStyle = () => {
    if (isDangerState || isEmergencyCapacity)
      return 'bg-orange-500/20 text-orange-400 text-sm font-bold px-2 py-1 border border-orange-500/30';
    if (column.quests.length > 0)
      return 'bg-gray-700/50 text-gray-300 text-sm font-medium px-2 py-1 border border-gray-600/30';
    return 'bg-gray-800/50 text-gray-500 text-sm px-2 py-1 border border-gray-700/30';
  };

  return (
    <div className="flex flex-col w-80 md:w-full md:flex-1 flex-shrink-0 min-w-[280px] h-full">
      <div className="mb-3 sm:mb-4 flex items-start justify-between min-h-[2.8rem]">
        <h3
          className={cn(
            'text-base sm:text-lg font-semibold leading-tight flex-1',
            isDangerState || isEmergencyCapacity ? 'text-orange-200' : ''
          )}
          style={{
            color:
              isDangerState || isEmergencyCapacity
                ? undefined
                : 'var(--color-primary-text)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {column.title}
          {(isDangerState || isEmergencyCapacity) && ' ⚠️'}
        </h3>

        <div className="flex items-start gap-2 flex-shrink-0 pt-0.5">
          {/* Count badge */}
          <span
            className={cn(
              'rounded-full transition-all duration-200',
              getCountBadgeStyle()
            )}
          >
            {column.quests.length}
          </span>

          {(isDangerState || isEmergencyCapacity) && (
            <span className="text-xs text-orange-400 font-medium">
              {column.quests.length === 3 ? 'CAPACITY FULL' : 'EMERGENCY'}
            </span>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto space-y-2 sm:space-y-3 p-2 rounded-lg min-h-[200px] transition-all',
          // Base styling
          'bg-gray-900/30 border border-gray-800',
          // Emergency capacity styling - red for 4 cards
          isEmergencyCapacity &&
            'bg-red-900/20 border-red-600 shadow-red-900/30 shadow-lg',
          // Hover state
          isOver &&
            !isDangerState &&
            !isEmergencyCapacity &&
            'border-blue-500 bg-blue-900/20',
          isOver && isDangerState && 'border-orange-500 bg-orange-900/30',
          isOver && isEmergencyCapacity && 'border-red-500 bg-red-900/30'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard({ view, missionId }: KanbanBoardProps) {
  const router = useRouter();
  const { quests, updateQuestStatus, deployQuest, completeQuest } =
    useCommandOpsStore();
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);
  const [emergencyDeployModalOpen, setEmergencyDeployModalOpen] =
    useState(false);
  const [questToActivate, setQuestToActivate] = useState<Quest | null>(null);
  const [debriefModalOpen, setDebriefModalOpen] = useState(false);
  const [questToComplete, setQuestToComplete] = useState<Quest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCapacityAlert, setShowCapacityAlert] = useState(false);
  const [newQuestOpen, setNewQuestOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [screenWidth, setScreenWidth] = useState(0);

  const handleColumnsChange = useCallback((newColumns: Column[]) => {
    setColumns(newColumns);
  }, []);

  // Configure sensors for better mobile experience with no ghost image
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
      onActivation: event => {
        // Disable default drag image for mouse
        if (event.event instanceof DragEvent && event.event.dataTransfer) {
          const emptyImg = new Image();
          emptyImg.src =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
          event.event.dataTransfer.setDragImage(emptyImg, 0, 0);
        }
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Track screen width for drag scrolling
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);

    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const quest = active.data.current?.quest;
    if (quest) {
      setActiveQuest(quest);
    }
  };

  useEffect(() => {
    if (!activeQuest) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      checkAndScroll();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        checkAndScroll();
      }
    };

    const checkAndScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const mouseX = mousePositionRef.current.x;

      // Much larger scroll zones - 30% of screen width from each edge
      const leftScrollZone = screenWidth * 0.3;
      const rightScrollZone = screenWidth * 0.3;
      const scrollSpeed = 6;

      // Left edge scrolling - when finger/mouse is in left 30% of screen
      if (mouseX < leftScrollZone) {
        container.scrollLeft -= scrollSpeed;
      }
      // Right edge scrolling - when finger/mouse is in right 30% of screen
      else if (mouseX > screenWidth - rightScrollZone) {
        container.scrollLeft += scrollSpeed;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeQuest, screenWidth]);

  const stopAutoScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveQuest(null);
    stopAutoScroll();

    if (!over) return;

    const draggedQuest = active.data.current?.quest as Quest;
    if (!draggedQuest) return;

    // Prevent moving completed quests
    if (draggedQuest.status === 'COMPLETED') return;

    // Check if we're dropping over a column
    const targetColumnData = over.data.current;
    if (targetColumnData?.type === 'column') {
      const targetColumn = targetColumnData.column as Column;

      if (targetColumn.status && draggedQuest.status !== targetColumn.status) {
        // Intercept PLANNING -> ACTIVE moves for deployment protocol
        if (
          draggedQuest.status === 'PLANNING' &&
          targetColumn.status === 'ACTIVE'
        ) {
          const currentActiveQuests = (quests || []).filter(
            q => q.status === 'ACTIVE'
          );

          // Block movement if already at capacity (4 cards = 3 normal + 1 emergency)
          if (currentActiveQuests.length >= 4) {
            setShowCapacityAlert(true);
            return;
          }

          setQuestToActivate(draggedQuest);

          // Check if we need Emergency Deploy Protocol
          if (currentActiveQuests.length >= 3) {
            setEmergencyDeployModalOpen(true);
          } else {
            setDeploymentModalOpen(true);
          }
          return;
        }

        // Intercept ACTIVE -> COMPLETED or PLANNING -> COMPLETED moves for mission debrief
        if (
          (draggedQuest.status === 'ACTIVE' ||
            draggedQuest.status === 'PLANNING') &&
          targetColumn.status === 'COMPLETED'
        ) {
          setQuestToComplete(draggedQuest);
          setDebriefModalOpen(true);
          return;
        }

        // For all other status changes, proceed normally
        updateQuestStatus(draggedQuest.id, targetColumn.status);
      }
    }
  };

  const handleDeployment = async (
    estimatedTime: number | null,
    firstAction: string
  ) => {
    if (!questToActivate) return;

    try {
      // Deploy the quest with the deployment protocol data
      await deployQuest(questToActivate.id, {
        estimatedTime,
        firstAction,
      });

      // Clean up state
      setDeploymentModalOpen(false);
      setQuestToActivate(null);
    } catch (error) {
      console.error('Failed to deploy quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Deployment',
        onRetry: async () => {
          if (!questToActivate) return;
          try {
            await deployQuest(questToActivate.id, {
              estimatedTime: null,
              firstAction: '',
            });
            setDeploymentModalOpen(false);
            setQuestToActivate(null);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        },
      });
      // Modal will stay open so user can try again
    }
  };

  const handleEmergencyDeployment = async (
    estimatedTime: number | null,
    firstAction: string,
    isEmergency: boolean
  ) => {
    if (!questToActivate) return;

    try {
      if (isEmergency) {
        // Use the activateQuestAction with emergency deploy flag
        const { activateQuestAction } = await import('@/app/actions/quests');
        await activateQuestAction(questToActivate.id, {
          estimatedTime: estimatedTime || undefined,
          firstTacticalStep: firstAction || undefined,
          isEmergencyDeploy: true,
        });
      } else {
        // Regular deployment
        await deployQuest(questToActivate.id, {
          estimatedTime,
          firstAction,
        });
      }

      // Clean up state
      setEmergencyDeployModalOpen(false);
      setQuestToActivate(null);
    } catch (error) {
      console.error('Failed to deploy quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Emergency Quest Deployment',
        onRetry: async () => {
          if (!questToActivate) return;
          try {
            const { activateQuestAction } = await import(
              '@/app/actions/quests'
            );
            await activateQuestAction(questToActivate.id, {
              estimatedTime: estimatedTime || undefined,
              firstTacticalStep: firstAction || undefined,
              isEmergencyDeploy: true,
            });
            setEmergencyDeployModalOpen(false);
            setQuestToActivate(null);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        },
      });
      // Modal will stay open so user can try again
    }
  };

  const handleMissionComplete = async (debriefData: {
    actualTime: number;
    debriefNotes: string;
    debriefSatisfaction: number | null;
  }) => {
    if (!questToComplete) return;

    try {
      // Complete the quest with the debrief data
      await completeQuest(questToComplete.id, debriefData);

      // Clean up state
      setDebriefModalOpen(false);
      setQuestToComplete(null);
    } catch (error) {
      console.error('Failed to complete quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Completion',
        onRetry: async () => {
          if (!questToComplete) return;
          try {
            await completeQuest(questToComplete.id, debriefData);
            setDebriefModalOpen(false);
            setQuestToComplete(null);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        },
      });
      // Modal will stay open so user can try again
    }
  };

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setDetailsModalOpen(true);
  };

  const handleEnterBattleStation = (quest: Quest) => {
    // Navigate to focus route
    router.push(`/focus/${quest.id}`);
  };

  return (
    <DataErrorBoundary context="kanban board">
      <div className="h-full flex flex-col">
        <KanbanFilter
          quests={quests || []}
          view={view}
          missionId={missionId}
          onColumnsChange={handleColumnsChange}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          autoScroll={false}
        >
          {/* Horizontal scrollable container for mobile/tablet */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden pb-3 sm:pb-4"
          >
            <div
              className="flex gap-3 sm:gap-4 md:gap-6 h-full min-w-max items-start"
              style={{ height: '100%' }}
            >
              {columns.map(column => (
                <DroppableColumn key={column.id} column={column}>
                  {column.quests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      {(quests || []).length === 0 &&
                      column.status === 'ACTIVE' ? (
                        <Button
                          onClick={() => setNewQuestOpen(true)}
                          className="text-sm sm:text-base font-bold"
                          variant="default"
                        >
                          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          DEPLOY NEW QUEST
                        </Button>
                      ) : (
                        <div className="text-gray-500 text-sm sm:text-base">
                          No quests
                        </div>
                      )}
                    </div>
                  ) : (
                    column.quests.map(quest => (
                      <DraggableQuestCard
                        key={quest.id}
                        quest={quest}
                        view={view}
                        onQuestClick={handleQuestClick}
                        onEnterBattleStation={handleEnterBattleStation}
                      />
                    ))
                  )}
                </DroppableColumn>
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeQuest ? (
              <DraggableQuestCard quest={activeQuest} view={view} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Custom Capacity Alert */}
        {showCapacityAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-red-500 rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-red-500 text-2xl">⚠️</div>
                <h3 className="text-lg font-bold text-red-400">
                  CAPACITY EXCEEDED
                </h3>
              </div>
              <div className="space-y-3 text-gray-300">
                <p>Active Operations is at maximum capacity (4 cards).</p>
                <p>
                  You have reached the 3-card limit plus 1 emergency deploy
                  slot.
                </p>
                <p className="text-yellow-400">
                  Complete some active quests before deploying new ones.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowCapacityAlert(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        <DeploymentProtocolDialog
          open={deploymentModalOpen}
          onOpenChange={setDeploymentModalOpen}
          onDeploy={handleDeployment}
          questTitle={questToActivate?.title || ''}
        />

        <EmergencyDeployModal
          open={emergencyDeployModalOpen}
          onOpenChange={setEmergencyDeployModalOpen}
          quest={questToActivate}
          activeQuestCount={
            (quests || []).filter(q => q.status === 'ACTIVE').length
          }
          onDeploy={handleEmergencyDeployment}
        />

        {questToComplete && (
          <MissionDebriefDialog
            open={debriefModalOpen}
            onOpenChange={setDebriefModalOpen}
            onComplete={handleMissionComplete}
            quest={questToComplete}
          />
        )}

        <QuestDetailsModal
          quest={selectedQuest}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />

        <NewQuestDialog open={newQuestOpen} onOpenChange={setNewQuestOpen} />
      </div>
    </DataErrorBoundary>
  );
}
