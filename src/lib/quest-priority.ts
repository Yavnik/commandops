import { Quest } from '@/types';
import { isToday, isPast } from 'date-fns';

/**
 * Quest Priority System (PRD v2 Specification)
 *
 * Priority order: Critical & Urgent → Critical & Not Urgent → Standard & Urgent → Standard & Not Urgent
 *
 * Critical: quest.isCritical = true
 * Urgent: quest.deadline is today or overdue
 */

export type QuestPriority = 1 | 2 | 3 | 4;

export function getQuestPriority(quest: Quest): QuestPriority {
  const isCritical = quest.isCritical === true;
  const isUrgent = quest.deadline
    ? isToday(new Date(quest.deadline)) || isPast(new Date(quest.deadline))
    : false;

  if (isCritical && isUrgent) return 1; // Critical & Urgent
  if (isCritical && !isUrgent) return 2; // Critical & Not Urgent
  if (!isCritical && isUrgent) return 3; // Standard & Urgent
  return 4; // Standard & Not Urgent
}

export function sortQuestsByPriority(quests: Quest[]): Quest[] {
  return (quests || []).sort((a, b) => {
    // Special handling for completed quests - sort by completedAt descending
    if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
      if (a.completedAt && b.completedAt) {
        return (
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      }
      // If one doesn't have completedAt, treat it as older
      if (a.completedAt && !b.completedAt) return -1;
      if (!a.completedAt && b.completedAt) return 1;
      return 0;
    }

    // Regular priority sorting for non-completed quests
    const priorityA = getQuestPriority(a);
    const priorityB = getQuestPriority(b);

    // Primary sort: by priority (lower number = higher priority)
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Secondary sort: by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function getPriorityLabel(priority: QuestPriority): string {
  switch (priority) {
    case 1:
      return 'Critical & Urgent';
    case 2:
      return 'Critical & Not Urgent';
    case 3:
      return 'Standard & Urgent';
    case 4:
      return 'Standard & Not Urgent';
  }
}

export function getPriorityColor(priority: QuestPriority): string {
  switch (priority) {
    case 1:
      return 'text-red-400'; // Critical & Urgent
    case 2:
      return 'text-yellow-400'; // Critical & Not Urgent
    case 3:
      return 'text-orange-400'; // Standard & Urgent
    case 4:
      return 'text-gray-400'; // Standard & Not Urgent
  }
}
