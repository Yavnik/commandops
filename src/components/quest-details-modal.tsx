'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatDuration } from '@/lib/time-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Star,
  Trash2,
  Edit,
  RotateCcw,
  Shield,
  Activity,
  Target,
  Zap,
  Timer,
} from 'lucide-react';
import { Quest } from '@/types';
import { cn } from '@/lib/utils';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { NewQuestDialog } from '@/components/new-quest-dialog';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

interface QuestDetailsModalProps {
  quest: Quest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestDetailsModal({
  quest,
  open,
  onOpenChange,
}: QuestDetailsModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { updateQuestStatus, missions, deleteQuest } = useCommandOpsStore();

  if (!quest) return null;

  const mission = quest.missionId
    ? (missions || []).find(m => m.id === quest.missionId)
    : null;

  const handleTerminate = async () => {
    if (!quest) return;

    setIsExecuting(true);
    try {
      await deleteQuest(quest.id);
      onOpenChange(false);
      setShowAbortConfirm(false);
    } catch (error) {
      console.error('Failed to terminate quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Termination',
        onRetry: async () => {
          if (!quest) return;
          setIsExecuting(true);
          try {
            await deleteQuest(quest.id);
            onOpenChange(false);
            setShowAbortConfirm(false);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          } finally {
            setIsExecuting(false);
          }
        },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTacticalRetreat = async () => {
    if (!quest) return;

    try {
      await updateQuestStatus(quest.id, 'PLANNING');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to retreat quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Status Change',
        onRetry: async () => {
          if (!quest) return;
          try {
            await updateQuestStatus(quest.id, 'PLANNING');
            onOpenChange(false);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        },
      });
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return {
          label: 'STANDBY',
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/30',
        };
      case 'ACTIVE':
        return {
          label: 'IN PROGRESS',
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          border: 'border-green-400/30',
        };
      case 'COMPLETED':
        return {
          label: 'MISSION COMPLETE',
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          border: 'border-yellow-400/30',
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          border: 'border-gray-400/30',
        };
    }
  };

  const getDeadlineStatus = (deadline: Date | null, questStatus: string) => {
    if (!deadline)
      return { label: 'NO DEADLINE', color: 'text-gray-400', icon: Clock };
    
    const deadlineDate = new Date(deadline);
    
    // For completed quests, just show the deadline date
    if (questStatus === 'COMPLETED') {
      return {
        label: format(deadlineDate, 'PPP').toUpperCase(),
        color: 'text-gray-400',
        icon: Calendar,
      };
    }

    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0)
      return { label: 'OVERDUE', color: 'text-red-400', icon: AlertTriangle };
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return {
          label: `${diffMinutes} MIN LEFT`,
          color: 'text-red-300',
          icon: Timer,
        };
      }
      return {
        label: `${diffHours} HR${diffHours !== 1 ? 'S' : ''} LEFT`,
        color: 'text-red-300',
        icon: Timer,
      };
    }
    if (diffDays === 1)
      return { label: 'DUE TOMORROW', color: 'text-yellow-400', icon: Timer };
    if (diffDays <= 7)
      return {
        label: `${diffDays} DAYS LEFT`,
        color: 'text-yellow-300',
        icon: Clock,
      };
    return {
      label: format(deadlineDate, 'PPP').toUpperCase(),
      color: 'text-gray-400',
      icon: Calendar,
    };
  };

  const formatDurationUppercase = (minutes: number | null) => {
    if (!minutes) return 'UNDETERMINED';
    return formatDuration(minutes).toUpperCase();
  };

  const getMissionEffectiveness = (satisfaction: number | null) => {
    if (!satisfaction)
      return { label: 'NOT ASSESSED', color: 'text-gray-400', icon: '⚪' };
    const ratings = {
      1: { label: 'CRITICAL FAILURE', color: 'text-red-400', icon: '🔴' },
      2: { label: 'BELOW STANDARD', color: 'text-orange-400', icon: '🟠' },
      3: { label: 'MISSION STANDARD', color: 'text-yellow-400', icon: '🟡' },
      4: { label: 'ABOVE STANDARD', color: 'text-green-400', icon: '🟢' },
      5: { label: 'EXCEPTIONAL', color: 'text-cyan-400', icon: '⭐' },
    };
    return (
      ratings[satisfaction as keyof typeof ratings] || {
        label: 'UNKNOWN',
        color: 'text-gray-400',
        icon: '⚪',
      }
    );
  };

  const renderTacticalActions = () => {
    switch (quest.status) {
      case 'PLANNING':
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="flex-1 text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              MODIFY
            </Button>
            <Button
              variant="critical"
              onClick={() => setShowAbortConfirm(true)}
              className="flex-1 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              DELETE
            </Button>
          </div>
        );

      case 'ACTIVE':
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleTacticalRetreat}
              className="flex-1 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              RETREAT
            </Button>
            <Button
              variant="critical"
              onClick={() => setShowAbortConfirm(true)}
              className="flex-1 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              DELETE
            </Button>
          </div>
        );

      case 'COMPLETED':
        return (
          <Button
            variant="critical"
            onClick={() => setShowAbortConfirm(true)}
            className="w-full text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            DELETE
          </Button>
        );

      default:
        return null;
    }
  };

  if (showAbortConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-red-500/30 bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2 text-center font-mono tracking-wider uppercase">
              <AlertTriangle className="h-5 w-5" />
              CONFIRM DELETE
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-300 mb-2 font-mono tracking-wide">
                CONFIRM QUEST DELETION
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-sm text-red-300 font-bold tracking-wider">
                  &quot;{quest.title}&quot;
                </p>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
              <p className="text-sm text-yellow-300 font-mono tracking-wide text-center">
                ⚠️ WARNING: THIS ACTION IS IRREVERSIBLE ⚠️
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAbortConfirm(false)}
              className="flex-1 font-mono tracking-wider"
            >
              CANCEL
            </Button>
            <Button
              variant="critical"
              onClick={handleTerminate}
              disabled={isExecuting}
              className="flex-1 font-mono tracking-wider"
            >
              {isExecuting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  DELETING...
                </>
              ) : (
                'CONFIRM DELETE'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const statusDisplay = getStatusDisplay(quest.status);
  const deadlineStatus = getDeadlineStatus(quest.deadline, quest.status);
  const effectiveness = getMissionEffectiveness(quest.debriefSatisfaction);

  return (
    <DataErrorBoundary context="quest details">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border-accent-text/30 bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-mono font-bold tracking-wider uppercase text-accent-text">
              {quest.title}
            </DialogTitle>
            {mission && (
              <p className="text-center text-sm text-gray-400 font-mono tracking-wide">
                MISSION: {mission.title.toUpperCase()}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-bold tracking-wider',
                  statusDisplay.color,
                  statusDisplay.bg,
                  statusDisplay.border
                )}
              >
                <Target className="h-4 w-4" />
                {statusDisplay.label}
              </div>
            </div>

            {/* Mission Briefing */}
            {quest.description && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-sm font-mono font-bold text-accent-text mb-3 tracking-wider uppercase flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  MISSION BRIEFING
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-mono">
                  {quest.description}
                </p>
              </div>
            )}

            {/* Tactical Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <deadlineStatus.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    DEADLINE
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm font-mono font-bold tracking-wide',
                    deadlineStatus.color
                  )}
                >
                  {deadlineStatus.label}
                </p>
                {quest.deadline && (
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {format(new Date(quest.deadline), 'yyyy.MM.dd HH:mm')}
                  </p>
                )}
              </div>

              <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    PRIORITY LEVEL
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm font-mono font-bold tracking-wide',
                    quest.isCritical ? 'text-red-400' : 'text-green-400'
                  )}
                >
                  {quest.isCritical ? '🔴 CRITICAL' : '🟢 STANDARD'}
                </p>
              </div>

              <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    EST. DURATION
                  </span>
                </div>
                <p className="text-sm font-mono font-bold tracking-wide text-cyan-400">
                  {formatDurationUppercase(quest.estimatedTime)}
                </p>
              </div>

              {quest.firstTacticalStep && (
                <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      FIRST TACTICAL STEP
                    </span>
                  </div>
                  <p className="text-sm font-mono text-gray-300 leading-relaxed">
                    {quest.firstTacticalStep}
                  </p>
                </div>
              )}
            </div>

            {/* Mission Debrief */}
            {quest.status === 'COMPLETED' && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-sm font-mono font-bold text-green-400 mb-4 tracking-wider uppercase flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  MISSION DEBRIEF
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-800/30 border border-slate-600/30 rounded p-3">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      ACTUAL DURATION
                    </span>
                    <p className="text-sm font-mono font-bold text-green-400 mt-1">
                      {formatDurationUppercase(quest.actualTime)}
                    </p>
                  </div>
                  <div className="bg-slate-800/30 border border-slate-600/30 rounded p-3">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      EFFECTIVENESS
                    </span>
                    <p
                      className={cn(
                        'text-sm font-mono font-bold mt-1',
                        effectiveness.color
                      )}
                    >
                      {effectiveness.icon} {effectiveness.label}
                    </p>
                  </div>
                </div>
                {quest.debriefNotes && (
                  <div className="bg-slate-800/30 border border-slate-600/30 rounded p-3">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      INTEL GATHERED
                    </span>
                    <p className="text-sm font-mono text-gray-300 mt-2 leading-relaxed">
                      {quest.debriefNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mission Timeline */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
              <h3 className="text-sm font-mono font-bold text-accent-text mb-4 tracking-wider uppercase flex items-center gap-2">
                <Clock className="h-4 w-4" />
                MISSION TIMELINE
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    INITIALIZED
                  </span>
                  <span className="text-sm font-mono text-cyan-400 font-bold">
                    {format(new Date(quest.createdAt), 'yyyy.MM.dd HH:mm')}
                  </span>
                </div>
                {quest.startedAt && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      DEPLOYED
                    </span>
                    <span className="text-sm font-mono text-green-400 font-bold">
                      {format(new Date(quest.startedAt), 'yyyy.MM.dd HH:mm')}
                    </span>
                  </div>
                )}
                {quest.completedAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      COMPLETED
                    </span>
                    <span className="text-sm font-mono text-yellow-400 font-bold">
                      {format(new Date(quest.completedAt), 'yyyy.MM.dd HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-600/30">
            {renderTacticalActions()}
          </DialogFooter>
        </DialogContent>

        {/* Edit Quest Dialog */}
        <NewQuestDialog
          editQuest={quest}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      </Dialog>
    </DataErrorBoundary>
  );
}
