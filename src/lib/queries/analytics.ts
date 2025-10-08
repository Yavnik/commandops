'use server';

import { db } from '@/db';
import { quests } from '@/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { safeServerAction } from '@/lib/error-handler';

export interface Analytics {
  operationalLoad: number; // 0-1 fraction of active quests / 3 (max capacity)
  weeklyMomentum: number; // Count of quests completed in last 7 days
  successRate: number; // Percentage of on-time completions in last 7 days
  estimateAccuracy: number; // Percentage accuracy of time estimates
}

/**
 * Calculate analytics using efficient SQL COUNT queries
 * Server action that handles auth and rate limiting
 */
export async function calculateAnalytics(): Promise<Analytics> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'calculate_analytics');

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Execute all analytics queries in parallel for efficiency
    const [
      questStatsResult,
      weeklyCompletedResult,
      recentCompletedWithDeadlineResult,
      recentOnTimeCompletedResult,
      questsWithEstimatesResult,
    ] = await Promise.all([
      // 1. Get basic quest stats using direct query for analytics
      db
        .select({
          activeCount: sql<number>`COUNT(*) FILTER (WHERE status = 'ACTIVE')`,
          completedCount: sql<number>`COUNT(*) FILTER (WHERE status = 'COMPLETED')`,
          planningCount: sql<number>`COUNT(*) FILTER (WHERE status = 'PLANNING')`,
          archivedCount: sql<number>`COUNT(*) FILTER (WHERE status = 'ARCHIVED')`,
          totalCount: sql<number>`COUNT(*)`,
        })
        .from(quests)
        .where(eq(quests.userId, userId)),

      // 2. Weekly completed count
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.userId, userId),
            eq(quests.status, 'COMPLETED'),
            gte(quests.completedAt, sevenDaysAgo)
          )
        ),

      // 3. Recent completed quests with deadlines
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.userId, userId),
            eq(quests.status, 'COMPLETED'),
            gte(quests.completedAt, sevenDaysAgo),
            sql`${quests.deadline} IS NOT NULL`
          )
        ),

      // 4. Recent on-time completed quests
      db
        .select({ count: sql<number>`count(*)` })
        .from(quests)
        .where(
          and(
            eq(quests.userId, userId),
            eq(quests.status, 'COMPLETED'),
            gte(quests.completedAt, sevenDaysAgo),
            sql`${quests.deadline} IS NOT NULL`,
            sql`${quests.completedAt} <= ${quests.deadline}`
          )
        ),

      // 5. Quests with time estimates for accuracy calculation
      db
        .select({
          avgAccuracy: sql<number>`AVG(
          CASE 
            WHEN ${quests.estimatedTime} > 0 AND ${quests.actualTime} > 0 
            THEN least(${quests.estimatedTime}, ${quests.actualTime})::float / greatest(${quests.estimatedTime}, ${quests.actualTime})::float
            ELSE NULL 
          END
        )`,
        })
        .from(quests)
        .where(
          and(
            eq(quests.userId, userId),
            eq(quests.status, 'COMPLETED'),
            sql`${quests.estimatedTime} > 0`,
            sql`${quests.actualTime} > 0`
          )
        ),
    ]);

    // Extract counts from results
    const questStats = questStatsResult[0] || {
      activeCount: 0,
      completedCount: 0,
      planningCount: 0,
      archivedCount: 0,
      totalCount: 0,
    };
    const activeCount = questStats.activeCount;
    const weeklyCompleted = weeklyCompletedResult[0].count;
    const recentCompletedWithDeadline =
      recentCompletedWithDeadlineResult[0].count;
    const recentOnTimeCompleted = recentOnTimeCompletedResult[0].count;
    const estimatesData = questsWithEstimatesResult[0];

    // Calculate metrics
    const operationalLoad = Math.min(activeCount / 3, 1); // Cap at 1.0

    const successRate =
      recentCompletedWithDeadline > 0
        ? Math.round(
            (recentOnTimeCompleted / recentCompletedWithDeadline) * 100
          )
        : 0;

    const estimateAccuracy = estimatesData?.avgAccuracy
      ? Math.round(estimatesData.avgAccuracy * 100)
      : 0;

    return {
      operationalLoad,
      weeklyMomentum: weeklyCompleted,
      successRate,
      estimateAccuracy,
    };
  });
}
