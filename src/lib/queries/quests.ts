'use server';

import { db } from '@/db';
import { quests } from '@/db/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { NotFoundError } from '@/lib/errors';
import { safeServerAction } from '@/lib/error-handler';
import { sortQuestsByPriority } from '@/lib/quest-priority';
import type { Quest, QuestStatus } from '@/types';

/**
 * Quest stats - efficient COUNT queries with FILTER clauses
 */
export async function getQuestStats(): Promise<{
  activeCount: number;
  completedCount: number;
  planningCount: number;
  archivedCount: number;
  totalCount: number;
}> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const result = await db
      .select({
        activeCount: sql<number>`COUNT(*) FILTER (WHERE status = 'ACTIVE')`,
        completedCount: sql<number>`COUNT(*) FILTER (WHERE status = 'COMPLETED')`,
        planningCount: sql<number>`COUNT(*) FILTER (WHERE status = 'PLANNING')`,
        archivedCount: sql<number>`COUNT(*) FILTER (WHERE status = 'ARCHIVED')`,
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(quests)
      .where(eq(quests.userId, userId));

    return (
      result[0] || {
        activeCount: 0,
        completedCount: 0,
        planningCount: 0,
        archivedCount: 0,
        totalCount: 0,
      }
    );
  });
}

/**
 * Get planning quests with priority sorting
 */
export async function getPlanningQuests(): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const rawQuests = await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, 'PLANNING')))
      .orderBy(asc(quests.createdAt));

    return sortQuestsByPriority(rawQuests);
  });
}

/**
 * Get active quests with priority sorting
 */
export async function getActiveQuests(): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const rawQuests = await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, 'ACTIVE')))
      .orderBy(asc(quests.createdAt));

    return sortQuestsByPriority(rawQuests);
  });
}

/**
 * Get completed quests
 */
export async function getCompletedQuests(): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    return await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, 'COMPLETED')))
      .orderBy(desc(quests.completedAt));
  });
}

/**
 * Get archived quests
 */
export async function getArchivedQuests(): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    return await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, 'ARCHIVED')))
      .orderBy(desc(quests.updatedAt));
  });
}

/**
 * Get quests by status
 */
export async function getQuestsByStatus(status: QuestStatus): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const questsByStatus = await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, status)));

    return questsByStatus;
  });
}

/**
 * Get kanban quests (all non-archived) with priority sorting
 */
export async function getKanbanQuests(): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const rawQuests = await db
      .select()
      .from(quests)
      .where(and(eq(quests.userId, userId), sql`status != 'ARCHIVED'`))
      .orderBy(asc(quests.createdAt));

    return sortQuestsByPriority(rawQuests);
  });
}

/**
 * Get quests for a specific mission
 */
export async function getQuestsByMission(missionId: string): Promise<Quest[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const rawQuests = await db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          eq(quests.missionId, missionId),
          sql`status != 'ARCHIVED'`
        )
      )
      .orderBy(asc(quests.createdAt));

    return sortQuestsByPriority(rawQuests);
  });
}

/**
 * Get quest by ID with ownership check
 */
export async function getQuestById(questId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const [quest] = await db
      .select()
      .from(quests)
      .where(and(eq(quests.id, questId), eq(quests.userId, userId)));

    if (!quest) {
      throw new NotFoundError();
    }

    return quest;
  });
}

/**
 * Get current active quest count for user
 */
export async function getActiveQuestCount(): Promise<number> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_read');

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, 'ACTIVE')));

    return result.count;
  });
}
