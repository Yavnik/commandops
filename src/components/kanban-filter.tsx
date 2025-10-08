'use client';

import { useEffect } from 'react';
import { Quest, KanbanViewType, QuestStatus } from '@/types';
import { isToday, isTomorrow, isThisWeek, isPast, isFuture } from 'date-fns';

interface Column {
  id: string;
  title: string;
  status?: QuestStatus;
  quests: Quest[];
}

interface KanbanFilterProps {
  quests: Quest[];
  view: KanbanViewType;
  missionId?: string;
  onColumnsChange: (columns: Column[]) => void;
}

export function KanbanFilter({
  quests,
  view,
  missionId,
  onColumnsChange,
}: KanbanFilterProps) {
  useEffect(() => {
    let relevantQuests: Quest[] = [];

    if (view === 'mission') {
      // Filter quests by mission directly from store data
      if (missionId) {
        relevantQuests = (quests || []).filter(q => q.missionId === missionId);
      } else {
        // Show quests without missions (Standalone Operations)
        relevantQuests = (quests || []).filter(q => !q.missionId);
      }
    } else if (view === 'deadline') {
      relevantQuests = quests || [];
    } else if (view === 'critical') {
      // Filter only critical quests
      relevantQuests = (quests || []).filter(q => q.isCritical);
    } else {
      relevantQuests = quests || [];
    }

    // Build columns based on view type
    if (view === 'mission' || view === 'all' || view === 'critical') {
      const planningQuests = (relevantQuests || []).filter(
        q => q.status === 'PLANNING'
      );
      const activeQuests = (relevantQuests || []).filter(
        q => q.status === 'ACTIVE'
      );

      // Filter completed quests to only show those from last 24 hours
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const completeQuests = (relevantQuests || [])
        .filter(q => q.status === 'COMPLETED' && q.completedAt)
        .filter(q => new Date(q.completedAt!) > twentyFourHoursAgo)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime()
        );

      onColumnsChange([
        {
          id: 'planning',
          title: 'Planning Zone',
          status: 'PLANNING',
          quests: planningQuests,
        },
        {
          id: 'active',
          title: 'Active Ops',
          status: 'ACTIVE',
          quests: activeQuests,
        },
        {
          id: 'complete',
          title: 'Mission Complete',
          status: 'COMPLETED',
          quests: completeQuests,
        },
      ]);
    } else if (view === 'deadline') {
      // Filter out completed quests from deadline view - only show PLANNING and ACTIVE
      const nonCompletedQuests = (relevantQuests || []).filter(
        q => q.status !== 'COMPLETED'
      );

      const overdue = (nonCompletedQuests || []).filter(
        q => q.deadline && isPast(new Date(q.deadline))
      );
      const today = (nonCompletedQuests || []).filter(
        q =>
          q.deadline &&
          isToday(new Date(q.deadline)) &&
          !isPast(new Date(q.deadline))
      );
      const tomorrow = (nonCompletedQuests || []).filter(
        q => q.deadline && isTomorrow(new Date(q.deadline))
      );
      const thisWeek = (nonCompletedQuests || []).filter(
        q =>
          q.deadline &&
          isThisWeek(new Date(q.deadline)) &&
          !isToday(new Date(q.deadline)) &&
          !isTomorrow(new Date(q.deadline)) &&
          !isPast(new Date(q.deadline))
      );
      const later = (nonCompletedQuests || []).filter(
        q =>
          q.deadline &&
          isFuture(new Date(q.deadline)) &&
          !isThisWeek(new Date(q.deadline))
      );
      const noDeadline = (nonCompletedQuests || []).filter(q => !q.deadline);

      onColumnsChange([
        { id: 'overdue', title: 'Overdue', quests: overdue },
        { id: 'today', title: 'Today', quests: today },
        { id: 'tomorrow', title: 'Tomorrow', quests: tomorrow },
        { id: 'thisWeek', title: 'This Week', quests: thisWeek },
        { id: 'later', title: 'Later', quests: later },
        { id: 'noDeadline', title: 'No Deadline', quests: noDeadline },
      ]);
    }
  }, [quests, view, missionId, onColumnsChange]);

  return null; // This component doesn't render anything
}
