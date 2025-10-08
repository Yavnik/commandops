'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Star,
  Shield,
  Target,
  Timer,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { ArchiveQuest } from '@/types/archive';
import { cn } from '@/lib/utils';

interface IntelDossierModalProps {
  quest: ArchiveQuest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntelDossierModal({
  quest,
  open,
  onOpenChange,
}: IntelDossierModalProps) {
  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      // ESC key to close
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!quest) return null;

  const getSatisfactionEmoji = (satisfaction: number | null) => {
    if (!satisfaction) return '—';
    if (satisfaction <= 2) return '🔥';
    if (satisfaction === 3) return '😐';
    return '🚀';
  };

  const getSatisfactionLabel = (satisfaction: number | null) => {
    if (!satisfaction) return 'NOT ASSESSED';
    const labels = {
      1: 'CRITICAL FAILURE',
      2: 'BELOW STANDARD',
      3: 'MISSION STANDARD',
      4: 'ABOVE STANDARD',
      5: 'EXCEPTIONAL',
    };
    return labels[satisfaction as keyof typeof labels] || 'UNKNOWN';
  };

  const getSatisfactionColor = (satisfaction: number | null) => {
    if (!satisfaction) return 'text-gray-400';
    if (satisfaction <= 2) return 'text-red-400';
    if (satisfaction === 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'UNDETERMINED';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}H ${mins}M`;
    }
    return `${mins}M`;
  };

  const getCompletionStatusDisplay = () => {
    const isOnTime = quest.completionStatus === 'on_time';
    return {
      label: isOnTime ? 'COMPLETED ON TIME' : 'COMPLETED OVERDUE',
      color: isOnTime ? 'text-green-400' : 'text-red-400',
      bg: isOnTime ? 'bg-green-400/10' : 'bg-red-400/10',
      border: isOnTime ? 'border-green-400/30' : 'border-red-400/30',
      icon: isOnTime ? CheckCircle : AlertTriangle,
    };
  };

  const getDeadlineDisplay = () => {
    if (!quest.deadline) return null;

    const deadlineDate = new Date(quest.deadline);
    const completedDate = quest.completedAt
      ? new Date(quest.completedAt)
      : null;

    if (!completedDate) return null;

    const diffMs = completedDate.getTime() - deadlineDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        label: `COMPLETED ${Math.abs(diffDays)} DAYS EARLY`,
        color: 'text-green-400',
      };
    } else {
      return {
        label: `COMPLETED ${diffDays} DAYS LATE`,
        color: 'text-red-400',
      };
    }
  };

  const completionStatus = getCompletionStatusDisplay();
  const deadlineDisplay = getDeadlineDisplay();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[95vh] max-h-[95vh] overflow-y-auto border-accent-text/30 bg-background/95 backdrop-blur-sm p-4 sm:p-6"
        aria-describedby="quest-intel-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-mono font-bold tracking-wider uppercase text-accent-text">
            INTEL DOSSIER: {quest.title}
          </DialogTitle>
          {quest.missionTitle && (
            <p className="text-center text-sm text-gray-400 font-mono tracking-wide">
              MISSION: {quest.missionTitle.toUpperCase()}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6" id="quest-intel-description">
          {/* Completion Status Badge */}
          <div className="flex justify-center">
            <div
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-bold tracking-wider',
                completionStatus.color,
                completionStatus.bg,
                completionStatus.border
              )}
            >
              <completionStatus.icon className="h-4 w-4" />
              {completionStatus.label}
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

          {/* Mission Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Completion Date */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                  COMPLETED
                </span>
              </div>
              <p className="text-sm font-mono font-bold tracking-wide text-cyan-400">
                {quest.completedAt
                  ? format(
                      new Date(quest.completedAt),
                      'yyyy.MM.dd HH:mm'
                    ).toUpperCase()
                  : 'NOT COMPLETED'}
              </p>
            </div>

            {/* Priority Level */}
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

            {/* Actual Duration */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                  ACTUAL DURATION
                </span>
              </div>
              <p className="text-sm font-mono font-bold tracking-wide text-cyan-400">
                {formatTime(quest.actualTime)}
              </p>
            </div>

            {/* Estimated Duration */}
            {quest.estimatedTime && (
              <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    EST. DURATION
                  </span>
                </div>
                <p className="text-sm font-mono font-bold tracking-wide text-gray-400">
                  {formatTime(quest.estimatedTime)}
                </p>
              </div>
            )}
          </div>

          {/* Deadline Analysis */}
          {deadlineDisplay && (
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
              <h3 className="text-sm font-mono font-bold text-accent-text mb-3 tracking-wider uppercase flex items-center gap-2">
                <Target className="h-4 w-4" />
                DEADLINE ANALYSIS
              </h3>
              <div className="space-y-2">
                {quest.deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      TARGET DEADLINE
                    </span>
                    <span className="text-sm font-mono text-gray-300">
                      {format(
                        new Date(quest.deadline),
                        'yyyy.MM.dd HH:mm'
                      ).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    PERFORMANCE
                  </span>
                  <span
                    className={cn(
                      'text-sm font-mono font-bold tracking-wide',
                      deadlineDisplay.color
                    )}
                  >
                    {deadlineDisplay.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mission Debrief */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-sm font-mono font-bold text-green-400 mb-4 tracking-wider uppercase flex items-center gap-2">
              <Target className="h-4 w-4" />
              MISSION DEBRIEF
            </h3>

            {/* Satisfaction Rating */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
                <div>
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    MISSION EFFECTIVENESS
                  </span>
                  <p
                    className={cn(
                      'text-sm font-mono font-bold mt-1',
                      getSatisfactionColor(quest.debriefSatisfaction)
                    )}
                  >
                    {getSatisfactionEmoji(quest.debriefSatisfaction)}{' '}
                    {getSatisfactionLabel(quest.debriefSatisfaction)}
                  </p>
                </div>
                {quest.debriefSatisfaction && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                      RATING
                    </span>
                    <p
                      className={cn(
                        'text-lg font-mono font-bold',
                        getSatisfactionColor(quest.debriefSatisfaction)
                      )}
                    >
                      {quest.debriefSatisfaction}/5
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Debrief Notes */}
            {quest.debriefNotes && (
              <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                  INTELLIGENCE GATHERED
                </span>
                <p className="text-sm font-mono text-gray-300 mt-2 leading-relaxed">
                  {quest.debriefNotes}
                </p>
              </div>
            )}
          </div>

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
              {quest.completedAt && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                    COMPLETED
                  </span>
                  <span className="text-sm font-mono text-green-400 font-bold">
                    {format(new Date(quest.completedAt), 'yyyy.MM.dd HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
