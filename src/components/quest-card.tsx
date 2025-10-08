'use client';

import { Quest, KanbanViewType } from '@/types';
import { Calendar, Star, Target, Clock, Timer } from 'lucide-react';
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  formatDistanceToNow,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/time-utils';

interface QuestCardProps {
  quest: Quest;
  view?: KanbanViewType;
  onQuestClick?: (quest: Quest) => void;
  onEnterBattleStation?: (quest: Quest) => void;
  className?: string;
}

export function QuestCard({
  quest,
  view = 'all',
  onQuestClick,
  onEnterBattleStation,
  className,
}: QuestCardProps) {
  const getQuestPriorityStyles = (
    isCritical: boolean | null,
    deadline: Date | null,
    status: string
  ) => {
    // For completed quests, use neutral styling regardless of priority/deadline
    if (status === 'COMPLETED') {
      return {
        borderClasses: 'border-gray-700',
        bgClasses: 'bg-gray-900/30',
        icon: null,
      };
    }

    const isOverdue = deadline && isPast(new Date(deadline));
    const isTodayDeadline = deadline && isToday(new Date(deadline));
    const isTomorrowDeadline = deadline && isTomorrow(new Date(deadline));

    // New Quest Visual Priority Matrix
    if (isCritical) {
      if (isOverdue) {
        // Critical + Overdue: Pulsing Red/Gold Alternating Border + Pulsing Red Background + ⭐🚨
        return {
          borderClasses: 'border-red-500 animate-pulse',
          bgClasses: 'bg-red-500/20 animate-pulse',
          icon: '⭐ 🚨',
        };
      } else if (isTodayDeadline) {
        // Critical + Today: Gold Border + Red Background + ⭐🔥
        return {
          borderClasses: 'border-yellow-500',
          bgClasses: 'bg-red-500/20',
          icon: '⭐ 🔥',
        };
      } else if (isTomorrowDeadline) {
        // Critical + Tomorrow: Gold Border + ⭐⚠️
        return {
          borderClasses: 'border-yellow-500',
          bgClasses: '',
          icon: '⭐ ⚠️',
        };
      } else {
        // Critical + Future/None: Gold Border + ⭐
        return {
          borderClasses: 'border-yellow-500',
          bgClasses: '',
          icon: '⭐',
        };
      }
    } else {
      if (isOverdue) {
        // Standard + Overdue: Red Border + Subtle Red Background + 🚨
        return {
          borderClasses: 'border-red-500',
          bgClasses: 'bg-red-500/10',
          icon: '🚨',
        };
      } else if (isTodayDeadline) {
        // Standard + Today: Red Border + 🔥
        return {
          borderClasses: 'border-red-500',
          bgClasses: '',
          icon: '🔥',
        };
      } else if (isTomorrowDeadline) {
        // Standard + Tomorrow: Yellow Border
        return {
          borderClasses: 'border-yellow-500',
          bgClasses: '',
          icon: null,
        };
      } else {
        // Standard + Future/None: Default (subtle grey)
        return {
          borderClasses: 'border-gray-700',
          bgClasses: '',
          icon: null,
        };
      }
    }
  };

  const priorityStyles = getQuestPriorityStyles(
    quest.isCritical,
    quest.deadline,
    quest.status
  );

  const getDeadlineText = () => {
    if (!quest.deadline) return null;

    const deadlineDate = new Date(quest.deadline);
    const now = new Date();

    if (isPast(deadlineDate)) {
      const relativeTime = formatDistanceToNow(deadlineDate, {
        addSuffix: true,
      });
      return `Overdue ${relativeTime.replace(/^about /, '')}`;
    } else if (isToday(deadlineDate)) {
      const hoursUntil = Math.round(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      const minutesUntil = Math.round(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60)
      );

      if (hoursUntil >= 1) {
        return `Today in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
      } else if (minutesUntil > 0) {
        return `Today in ${minutesUntil} min${minutesUntil > 1 ? 's' : ''}`;
      } else {
        return 'Today (now)';
      }
    } else if (isTomorrow(deadlineDate)) {
      return 'Tomorrow';
    } else {
      return format(deadlineDate, 'MMM d');
    }
  };

  const getDeadlineColor = () => {
    if (!quest.deadline) return 'text-gray-500';

    const deadlineDate = new Date(quest.deadline);
    if (isPast(deadlineDate)) return 'text-red-400';
    if (isToday(deadlineDate)) return 'text-red-300';
    if (isTomorrow(deadlineDate)) return 'text-yellow-400';
    if (isThisWeek(deadlineDate)) return 'text-yellow-300';
    return 'text-gray-400';
  };

  const getDisplayTime = () => {
    // For completed quests, show actual time if available, otherwise estimated time
    if (quest.status === 'COMPLETED') {
      return quest.actualTime || quest.estimatedTime;
    }
    // For active/planning quests, show estimated time
    return quest.estimatedTime;
  };

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return null;

    const relativeTime = formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });

    // Convert "about X" to just "X" for cleaner display
    return relativeTime.replace(/^about /, '');
  };

  const shouldShowStatusTag = () => {
    // Only show status tags in deadline view where columns don't indicate status
    return view === 'deadline';
  };

  return (
    <div
      onClick={e => {
        // Don't trigger on interactive elements
        const target = e.target as HTMLElement;
        if (
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('button')
        )
          return;

        onQuestClick?.(quest);
      }}
      className={cn(
        'rounded-lg border-2 p-3 sm:p-4 select-none relative cursor-pointer transition-all duration-200',
        quest.status === 'COMPLETED'
          ? 'opacity-75 hover:opacity-90'
          : 'hover:shadow-lg',
        priorityStyles.borderClasses,
        priorityStyles.bgClasses,
        className
      )}
    >
      {/* Header with title and priority indicators */}
      <div className="flex items-start justify-between mb-2 overflow-hidden">
        <h4
          className="font-semibold text-sm sm:text-base flex-1 pr-2 overflow-hidden"
          style={{
            width: '0',
            minWidth: 'calc(100% - 2rem)',
            color: 'var(--color-primary-text)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {quest.title}
        </h4>
        <div className="flex-shrink-0 w-8 flex justify-end">
          {priorityStyles.icon ? (
            <div className="text-sm">{priorityStyles.icon}</div>
          ) : (
            quest.isCritical &&
            quest.status !== 'COMPLETED' && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
            )
          )}
        </div>
      </div>

      {/* Description */}
      {quest.description && (
        <div
          className="text-xs sm:text-sm mb-3 line-clamp-2"
          style={{
            width: '0',
            minWidth: '100%',
            color: 'var(--color-primary-text)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {quest.description}
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between text-xs">
        {/* Left side content based on status */}
        <div className="flex items-center gap-2">
          {quest.status === 'COMPLETED'
            ? // Completed: Show relative time since completion
              quest.completedAt && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">
                    {formatRelativeTime(quest.completedAt)}
                  </span>
                </div>
              )
            : // Planning/Active: Show deadline only
              quest.deadline && (
                <div
                  className={cn('flex items-center gap-1', getDeadlineColor())}
                >
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{getDeadlineText()}</span>
                </div>
              )}
        </div>

        {/* Right side content based on status */}
        <div className="flex items-center gap-2">
          {quest.status === 'COMPLETED' && getDisplayTime() && (
            // Completed: Show actual time taken
            <div className="flex items-center gap-1 text-gray-500">
              <Timer className="h-3 w-3" />
              <span>
                {quest.actualTime ? '' : '~'}
                {formatTime(getDisplayTime()!)}
              </span>
            </div>
          )}

          {/* Enter Battle Station button for active quests */}
          {quest.status === 'ACTIVE' && onEnterBattleStation && (
            <button
              onClick={e => {
                e.stopPropagation();
                onEnterBattleStation(quest);
              }}
              className="px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/50 text-red-300 hover:text-red-200 transition-colors border border-red-500/50 flex items-center gap-1"
              title="Enter Battle Station"
            >
              <Target className="h-3 w-3" />
              <span className="text-xs font-medium">FOCUS</span>
            </button>
          )}

          {/* Conditional status indicator */}
          {shouldShowStatusTag() && (
            <div
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                quest.status === 'PLANNING' && 'bg-blue-500/20 text-blue-400',
                quest.status === 'ACTIVE' && 'bg-green-500/20 text-green-400',
                quest.status === 'COMPLETED' && 'bg-gray-500/20 text-gray-400'
              )}
            >
              {quest.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
