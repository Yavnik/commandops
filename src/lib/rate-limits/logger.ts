import { db } from '@/db';
import { rateLimitLogs } from '@/db/schema';
import { generateId } from '@/lib/utils';
import { eq, gte, desc } from 'drizzle-orm';
import type { RateLimitLogEvent } from './types';

/**
 * Log a rate limit event to the database
 * This runs in the background and doesn't throw to avoid blocking the main flow
 */
export async function logRateLimitEvent(
  event: RateLimitLogEvent
): Promise<void> {
  try {
    await db.insert(rateLimitLogs).values({
      id: generateId(),
      userId: event.userId,
      action: event.action,
      limitValue: event.limitValue,
      currentCount: event.currentCount,
      windowMs: event.windowMs,
      exceeded: event.exceeded,
      rateLimiterEnabled: event.rateLimiterEnabled,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
    });
  } catch (error) {
    // Log to console but don't throw - logging shouldn't break the app
    console.error('Failed to log rate limit event:', error, {
      userId: event.userId,
      action: event.action,
      exceeded: event.exceeded,
    });
  }
}

/**
 * Get rate limit violations for analysis
 */
export async function getRateLimitViolations(
  options: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
) {
  try {
    const { limit = 100 } = options;

    const query = db
      .select()
      .from(rateLimitLogs)
      .where(eq(rateLimitLogs.exceeded, true))
      .orderBy(desc(rateLimitLogs.createdAt))
      .limit(limit);

    // Note: This is simplified - in practice you'd add proper where conditions
    // based on the provided filters using Drizzle's conditional query building

    return await query;
  } catch (error) {
    console.error('Failed to get rate limit violations:', error);
    return [];
  }
}

/**
 * Get rate limit statistics for decision making
 */
export async function getRateLimitStats(
  action?: string,
  days: number = 7
): Promise<{
  totalEvents: number;
  violationsCount: number;
  violationRate: number;
  topUsers: Array<{ userId: string; violations: number }>;
}> {
  try {
    // This would typically use proper SQL aggregation
    // For now, returning a basic structure
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Simplified implementation - in practice you'd use proper aggregation queries
    const events = await db
      .select()
      .from(rateLimitLogs)
      .where(gte(rateLimitLogs.createdAt, startDate));

    const totalEvents = events.length;
    const violations = events.filter(e => e.exceeded);
    const violationsCount = violations.length;
    const violationRate =
      totalEvents > 0 ? (violationsCount / totalEvents) * 100 : 0;

    // Count violations per user
    const userViolations = new Map<string, number>();
    violations.forEach(v => {
      userViolations.set(v.userId, (userViolations.get(v.userId) || 0) + 1);
    });

    const topUsers = Array.from(userViolations.entries())
      .map(([userId, violations]) => ({ userId, violations }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);

    return {
      totalEvents,
      violationsCount,
      violationRate,
      topUsers,
    };
  } catch (error) {
    console.error('Failed to get rate limit stats:', error);
    return {
      totalEvents: 0,
      violationsCount: 0,
      violationRate: 0,
      topUsers: [],
    };
  }
}
