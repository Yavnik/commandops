'use client';

import React from 'react';
import { ArchiveMission } from '@/types/archive';
import { TableHeader } from './table-header';
import { format } from 'date-fns';

interface MissionHistoryTableProps {
  missions: ArchiveMission[];
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortKey: string) => void;
  onMissionClick?: (mission: ArchiveMission) => void;
  onViewQuests?: (missionId: string, missionTitle: string) => void;
}

export const MissionHistoryTable = React.memo(function MissionHistoryTable({
  missions,
  currentSortBy,
  currentSortOrder,
  onSort,
  onMissionClick,
  onViewQuests,
}: MissionHistoryTableProps) {
  const formatSatisfactionRate = (avgSatisfaction: number | null) => {
    if (!avgSatisfaction)
      return { percentage: 0, display: '—', color: 'text-secondary-text' };
    const percentage = Math.round((avgSatisfaction / 5) * 100);

    // Color-code based on satisfaction level
    let color = 'text-secondary-text';
    if (percentage >= 80) color = 'text-green-400';
    else if (percentage >= 60) color = 'text-yellow-400';
    else color = 'text-red-400';

    return { percentage, display: `${percentage}%`, color };
  };

  // Helper component for quest count display
  const QuestCountDisplay = React.memo(({ count }: { count: number }) => {
    if (count === 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-secondary-text">No Quests</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary-accent rounded-full" />
          <span className="text-primary-text font-medium">{count}</span>
        </div>
        <span className="text-secondary-text text-sm">
          {count === 1 ? 'Quest' : 'Quests'}
        </span>
      </div>
    );
  });

  // Helper component for satisfaction rate with progress bar
  const SatisfactionRateDisplay = React.memo(
    ({ avgSatisfaction }: { avgSatisfaction: number | null }) => {
      const { percentage, display, color } =
        formatSatisfactionRate(avgSatisfaction);

      if (percentage === 0) {
        return <span className="text-secondary-text">—</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-medium ${color}`}>{display}</span>
          <div className="w-full bg-tabs-border rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                percentage >= 80
                  ? 'bg-green-400'
                  : percentage >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    }
  );

  QuestCountDisplay.displayName = 'QuestCountDisplay';
  SatisfactionRateDisplay.displayName = 'SatisfactionRateDisplay';

  if (missions.length === 0) {
    // Empty state will be handled by parent component
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-tabs-border">
            <TableHeader
              label="Title"
              sortKey="title"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[25%] min-w-[160px]"
            />
            <TableHeader
              label="Objective"
              sortKey="objective"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[30%] min-w-[200px] hidden sm:table-cell"
            />
            <TableHeader
              label="Archived"
              sortKey="archivedAt"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[15%] min-w-[120px]"
            />
            <TableHeader
              label="Quests"
              sortKey="questCount"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[10%] min-w-[80px]"
            />
            <TableHeader
              label="Satisfaction Rate"
              sortKey="avgSatisfaction"
              currentSortBy={currentSortBy}
              currentSortOrder={currentSortOrder}
              onSort={onSort}
              className="w-[10%] min-w-[100px] hidden md:table-cell"
            />
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider w-[10%] min-w-[100px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {missions.map(mission => (
            <tr
              key={mission.id}
              className="border-b border-tabs-border/30 hover:bg-tabs-bg/50 transition-colors cursor-pointer"
              onClick={() => onMissionClick?.(mission)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      title="Archived Mission"
                    />
                    <span className="text-primary-text font-medium">
                      {mission.title}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-secondary-text">
                  {mission.objective || '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-secondary-text">
                  {mission.archivedAt
                    ? format(new Date(mission.archivedAt), 'MMM dd, yyyy')
                    : '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <QuestCountDisplay count={mission.questCount} />
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <SatisfactionRateDisplay
                  avgSatisfaction={mission.avgSatisfaction}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onViewQuests?.(mission.id, mission.title);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    mission.questCount === 0
                      ? 'text-secondary-text bg-tabs-border cursor-not-allowed'
                      : 'text-primary-accent bg-primary-accent/10 hover:bg-primary-accent/20 border border-primary-accent/30 hover:scale-105 active:scale-95'
                  }`}
                  disabled={mission.questCount === 0}
                  title={
                    mission.questCount === 0
                      ? 'No quests in this mission'
                      : `View archived quests from ${mission.title} (${mission.questCount} total quest${mission.questCount === 1 ? '' : 's'})`
                  }
                >
                  View Quests
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
