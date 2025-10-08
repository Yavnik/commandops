'use server';

import { db } from '@/db';
import { missions, quests } from '@/db/schema';
import { eq, and, sql, desc, ilike } from 'drizzle-orm';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { NotFoundError } from '@/lib/errors';
import { safeServerAction } from '@/lib/error-handler';
import { validateSearchQuery } from '@/lib/auth/validation';
import type { Mission } from '@/types';

/**
 * Get active missions for the current user
 */
export async function getActiveMissions(): Promise<Mission[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    const activeMissions = await db
      .select({
        id: missions.id,
        userId: missions.userId,
        title: missions.title,
        objective: missions.objective,
        status: missions.status,
        archivedAt: missions.archivedAt,
        afterActionReport: missions.afterActionReport,
        createdAt: missions.createdAt,
        updatedAt: missions.updatedAt,
        totalQuestCount: sql<number>`COALESCE(COUNT(${quests.id}), 0)`,
        completedQuestCount: sql<number>`COALESCE(COUNT(CASE WHEN ${quests.status} = 'COMPLETED' THEN 1 END), 0)`,
      })
      .from(missions)
      .leftJoin(quests, eq(missions.id, quests.missionId))
      .where(and(eq(missions.userId, userId), eq(missions.status, 'ACTIVE')))
      .groupBy(missions.id)
      .orderBy(missions.createdAt);

    return activeMissions;
  });
}

/**
 * Get archived missions for the current user
 */
export async function getArchivedMissions(): Promise<Mission[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    const archivedMissions = await db
      .select({
        id: missions.id,
        userId: missions.userId,
        title: missions.title,
        objective: missions.objective,
        status: missions.status,
        archivedAt: missions.archivedAt,
        afterActionReport: missions.afterActionReport,
        createdAt: missions.createdAt,
        updatedAt: missions.updatedAt,
        totalQuestCount: sql<number>`COALESCE(COUNT(${quests.id}), 0)`,
        completedQuestCount: sql<number>`COALESCE(COUNT(CASE WHEN ${quests.status} = 'COMPLETED' THEN 1 END), 0)`,
      })
      .from(missions)
      .leftJoin(quests, eq(missions.id, quests.missionId))
      .where(and(eq(missions.userId, userId), eq(missions.status, 'ARCHIVED')))
      .groupBy(missions.id)
      .orderBy(desc(missions.updatedAt));

    return archivedMissions;
  });
}

/**
 * Get all missions for the current user (for mission control overview)
 */
export async function getAllMissions(): Promise<Mission[]> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    return await db
      .select({
        id: missions.id,
        userId: missions.userId,
        title: missions.title,
        objective: missions.objective,
        status: missions.status,
        archivedAt: missions.archivedAt,
        afterActionReport: missions.afterActionReport,
        createdAt: missions.createdAt,
        updatedAt: missions.updatedAt,
        totalQuestCount: sql<number>`COALESCE(COUNT(${quests.id}), 0)`,
        completedQuestCount: sql<number>`COALESCE(COUNT(CASE WHEN ${quests.status} = 'COMPLETED' THEN 1 END), 0)`,
      })
      .from(missions)
      .leftJoin(quests, eq(missions.id, quests.missionId))
      .where(eq(missions.userId, userId))
      .groupBy(missions.id)
      .orderBy(missions.createdAt);
  });
}

/**
 * Get mission by ID with ownership check
 */
export async function getMissionById(missionId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    const [mission] = await db
      .select()
      .from(missions)
      .where(and(eq(missions.id, missionId), eq(missions.userId, userId)));

    if (!mission) {
      throw new NotFoundError();
    }

    return mission;
  });
}

/**
 * Get mission progress (quest statistics)
 */
export async function getMissionProgress(missionId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    // First verify mission ownership
    const [mission] = await db
      .select()
      .from(missions)
      .where(and(eq(missions.id, missionId), eq(missions.userId, userId)));

    if (!mission) {
      throw new NotFoundError();
    }

    // Use SQL COUNT queries for efficiency
    const [
      totalResult,
      completedResult,
      activeResult,
      planningResult,
      criticalResult,
      criticalCompletedResult,
    ] = await Promise.all([
      // Total quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(and(eq(quests.missionId, missionId), eq(quests.userId, userId))),
      // Completed quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.missionId, missionId),
            eq(quests.userId, userId),
            eq(quests.status, 'COMPLETED')
          )
        ),
      // Active quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.missionId, missionId),
            eq(quests.userId, userId),
            eq(quests.status, 'ACTIVE')
          )
        ),
      // Planning quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.missionId, missionId),
            eq(quests.userId, userId),
            eq(quests.status, 'PLANNING')
          )
        ),
      // Critical quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.missionId, missionId),
            eq(quests.userId, userId),
            eq(quests.isCritical, true)
          )
        ),
      // Critical completed quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.missionId, missionId),
            eq(quests.userId, userId),
            eq(quests.isCritical, true),
            eq(quests.status, 'COMPLETED')
          )
        ),
    ]);

    const total = totalResult[0].count;
    const completed = completedResult[0].count;
    const active = activeResult[0].count;
    const planning = planningResult[0].count;
    const critical = criticalResult[0].count;
    const criticalCompleted = criticalCompletedResult[0].count;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      missionId,
      total,
      completed,
      active,
      planning,
      critical,
      criticalCompleted,
      percentage,
    };
  });
}

/**
 * Get missions for filter dropdown
 */
export async function getMissionsForFilter(): Promise<{
  missions: Array<{ id: string; title: string }>;
}> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    const userMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
      })
      .from(missions)
      .where(eq(missions.userId, userId))
      .orderBy(desc(missions.updatedAt))
      .limit(50);

    return {
      missions: userMissions,
    };
  });
}

/**
 * Search missions by query
 */
export async function searchMissions(query: string): Promise<{
  missions: Array<{ id: string; title: string }>;
}> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'search');

    if (!query || query.trim().length < 2) {
      return { missions: [] };
    }

    const sanitizedQuery = validateSearchQuery(query);
    const searchTerm = `%${sanitizedQuery}%`;

    const searchResults = await db
      .select({
        id: missions.id,
        title: missions.title,
      })
      .from(missions)
      .where(
        and(eq(missions.userId, userId), ilike(missions.title, searchTerm))
      )
      .orderBy(desc(missions.updatedAt))
      .limit(20);

    return {
      missions: searchResults,
    };
  });
}

/**
 * Mission stats for dashboard
 */
export async function getMissionStats(): Promise<{
  activeMissions: number;
  archivedMissions: number;
  totalMissions: number;
}> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_read');

    const result = await db
      .select({
        activeMissions: sql<number>`COUNT(*) FILTER (WHERE status = 'ACTIVE')`,
        archivedMissions: sql<number>`COUNT(*) FILTER (WHERE status = 'ARCHIVED')`,
        totalMissions: sql<number>`COUNT(*)`,
      })
      .from(missions)
      .where(eq(missions.userId, userId));

    return (
      result[0] || {
        activeMissions: 0,
        archivedMissions: 0,
        totalMissions: 0,
      }
    );
  });
}
