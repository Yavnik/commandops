'use client';

import { ArchiveQuest } from '@/types/archive';
import { TableHeader } from './table-header';
import { format } from 'date-fns';

interface QuestLogTableProps {
  quests: ArchiveQuest[];
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortKey: string) => void;
  onQuestClick?: (quest: ArchiveQuest) => void;
}

export function QuestLogTable({
  quests,
  currentSortBy,
  currentSortOrder,
  onSort,
  onQuestClick,
}: QuestLogTableProps) {
  const getSatisfactionEmoji = (satisfaction: number | null) => {
    if (!satisfaction) return '—';
    if (satisfaction <= 2) return '🔥';
    if (satisfaction === 3) return '😐';
    return '🚀';
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusIndicator = (quest: ArchiveQuest) => {
    const isOnTime = quest.completionStatus === 'on_time';
    return (
      <div
        className={`w-3 h-3 rounded-full ${
          isOnTime ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={isOnTime ? 'Completed on time' : 'Completed overdue'}
      />
    );
  };

  if (quests.length === 0) {
    // Empty state will be handled by parent component
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-tabs-border">
            <TableHeader
              label="Status"
              sortKey="completionStatus"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-20"
            />
            <TableHeader
              label="Title"
              sortKey="title"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[40%]"
            />
            <TableHeader
              label="Mission"
              sortKey="missionTitle"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[20%]"
            />
            <TableHeader
              label="Completed"
              sortKey="completedAt"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[15%]"
            />
            <TableHeader
              label="Time"
              sortKey="actualTime"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[10%]"
            />
            <TableHeader
              label="Rating"
              sortKey="debriefSatisfaction"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[10%]"
            />
          </tr>
        </thead>
        <tbody>
          {quests.map(quest => (
            <tr
              key={quest.id}
              className={`border-b border-tabs-border/30 hover:bg-tabs-bg/50 transition-colors ${
                onQuestClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onQuestClick?.(quest)}
            >
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  {getStatusIndicator(quest)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-text font-medium truncate">
                    {quest.title}
                  </span>
                  {quest.isCritical && (
                    <span className="text-red-400 text-xs font-bold">⚠</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-secondary-text">
                  {quest.missionTitle || 'Standalone'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-secondary-text">
                  {quest.completedAt
                    ? format(new Date(quest.completedAt), 'MMM dd, yyyy')
                    : '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-secondary-text">
                  {formatTime(quest.actualTime)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <span className="text-lg">
                    {getSatisfactionEmoji(quest.debriefSatisfaction)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
