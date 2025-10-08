'use server';

import { db } from '@/db';
import { quests, missions } from '@/db/schema';
import {
  and,
  eq,
  sql,
  desc,
  asc,
  gte,
  lte,
  inArray,
  or,
  ilike,
} from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { safeServerAction, createErrorContext } from '@/lib/error-handler';
import type {
  ArchiveQuest,
  ArchiveMission,
  QuestArchiveRequest,
  MissionArchiveRequest,
  PaginationState,
} from '@/types/archive';

/**
 * Get archived quests with filtering, sorting, and pagination
 */
export async function getArchivedQuests(
  userId: string,
  filters: QuestArchiveRequest
): Promise<{ data: ArchiveQuest[]; pagination: PaginationState }> {
  return safeServerAction(async () => {
    const {
      page = 1,
      pageSize = 25,
      search,
      startDate,
      endDate,
      missionIds,
      satisfaction,
      criticalOnly,
      sortBy = 'completedAt',
      sortOrder = 'desc',
    } = filters;

    // Build WHERE conditions
    const conditions = [
      eq(quests.userId, userId),
      inArray(quests.status, ['COMPLETED', 'ARCHIVED']),
    ];

    // Search filter - ILIKE search
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(quests.title, searchTerm),
          ilike(quests.description, searchTerm),
          ilike(quests.debriefNotes, searchTerm)
        )!
      );
    }

    // Date range filter
    if (startDate) {
      conditions.push(gte(quests.completedAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(quests.completedAt, new Date(endDate)));
    }

    // Mission filter
    if (missionIds && missionIds.length > 0) {
      // Handle "standalone" operations (null missionId) as a special case
      if (missionIds.includes('standalone')) {
        const otherMissionIds = missionIds.filter(id => id !== 'standalone');
        if (otherMissionIds.length > 0) {
          conditions.push(
            or(
              eq(quests.missionId, sql`NULL`),
              inArray(quests.missionId, otherMissionIds)
            )!
          );
        } else {
          conditions.push(eq(quests.missionId, sql`NULL`));
        }
      } else {
        conditions.push(inArray(quests.missionId, missionIds));
      }
    }

    // Satisfaction filter
    if (satisfaction && satisfaction.length > 0) {
      conditions.push(inArray(quests.debriefSatisfaction, satisfaction));
    }

    // Critical filter
    if (criticalOnly) {
      conditions.push(eq(quests.isCritical, true));
    }

    const offset = (page - 1) * pageSize;

    // Build sorting
    let orderBy;
    const sortDirection = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'title':
        orderBy = sortDirection(quests.title);
        break;
      case 'completedAt':
        orderBy = sortDirection(quests.completedAt);
        break;
      case 'actualTime':
        orderBy = sortDirection(quests.actualTime);
        break;
      case 'debriefSatisfaction':
        orderBy = sortDirection(quests.debriefSatisfaction);
        break;
      default:
        orderBy = desc(quests.completedAt);
    }

    // Single optimized query with window function for total count
    const results = await db
      .select({
        id: quests.id,
        userId: quests.userId,
        missionId: quests.missionId,
        title: quests.title,
        description: quests.description,
        isCritical: quests.isCritical,
        status: quests.status,
        deadline: quests.deadline,
        estimatedTime: quests.estimatedTime,
        actualTime: quests.actualTime,
        completedAt: quests.completedAt,
        debriefNotes: quests.debriefNotes,
        debriefSatisfaction: quests.debriefSatisfaction,
        createdAt: quests.createdAt,
        updatedAt: quests.updatedAt,
        missionTitle: missions.title,
        totalCount: sql<number>`COUNT(*) OVER()`,
      })
      .from(quests)
      .leftJoin(missions, eq(quests.missionId, missions.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Extract totalCount from first result (all rows have the same totalCount due to window function)
    const totalCount = results.length > 0 ? Number(results[0].totalCount) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Transform results to include computed fields
    const data: ArchiveQuest[] = results.map(row => ({
      ...row,
      status: row.status as 'COMPLETED' | 'ARCHIVED',
      missionTitle: row.missionTitle || null,
      completionStatus:
        row.completedAt && row.deadline && row.completedAt <= row.deadline
          ? ('on_time' as const)
          : ('overdue' as const),
    }));

    const pagination: PaginationState = {
      page,
      pageSize,
      totalCount,
      totalPages,
    };

    return { data, pagination };
  });
}

/**
 * Get archived missions with filtering, sorting, and pagination
 */
export async function getArchivedMissions(
  userId: string,
  filters: MissionArchiveRequest
): Promise<{ data: ArchiveMission[]; pagination: PaginationState }> {
  return safeServerAction(async () => {
    const {
      page = 1,
      pageSize = 25,
      search,
      archivedStartDate,
      archivedEndDate,
      sortBy = 'archivedAt',
      sortOrder = 'desc',
    } = filters;

    // Build WHERE conditions for missions
    const conditions = [
      eq(missions.userId, userId),
      eq(missions.status, 'ARCHIVED'),
    ];

    // Search filter - ILIKE search
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(missions.title, searchTerm),
          ilike(missions.objective, searchTerm)
        )!
      );
    }

    // Archived date range filter
    if (archivedStartDate) {
      conditions.push(gte(missions.archivedAt, new Date(archivedStartDate)));
    }
    if (archivedEndDate) {
      conditions.push(lte(missions.archivedAt, new Date(archivedEndDate)));
    }

    const offset = (page - 1) * pageSize;

    // Build sorting for the main query
    let orderBy;
    const sortDirection = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'title':
        orderBy = sortDirection(missions.title);
        break;
      case 'objective':
        orderBy = sortDirection(missions.objective);
        break;
      case 'archivedAt':
        orderBy = sortDirection(missions.archivedAt);
        break;
      case 'questCount':
        orderBy = sortDirection(sql<number>`COUNT(${quests.id})`);
        break;
      case 'avgSatisfaction':
        orderBy = sortDirection(
          sql<number>`AVG(${quests.debriefSatisfaction})`
        );
        break;
      default:
        orderBy = desc(missions.archivedAt);
    }

    // Single optimized query with window function for total count
    const paginatedResults = await db
      .select({
        id: missions.id,
        userId: missions.userId,
        title: missions.title,
        objective: missions.objective,
        status: missions.status,
        archivedAt: missions.archivedAt,
        createdAt: missions.createdAt,
        updatedAt: missions.updatedAt,
        questCount: sql<number>`COUNT(${quests.id})`,
        avgSatisfaction: sql<number>`AVG(${quests.debriefSatisfaction})`,
        totalCount: sql<number>`COUNT(*) OVER()`,
      })
      .from(missions)
      .leftJoin(
        quests,
        and(
          eq(missions.id, quests.missionId),
          inArray(quests.status, ['COMPLETED', 'ARCHIVED'])
        )
      )
      .where(and(...conditions))
      .groupBy(
        missions.id,
        missions.userId,
        missions.title,
        missions.objective,
        missions.status,
        missions.archivedAt,
        missions.createdAt,
        missions.updatedAt
      )
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Extract totalCount from first result (all rows have the same totalCount due to window function)
    const totalCount =
      paginatedResults.length > 0 ? Number(paginatedResults[0].totalCount) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Transform results
    const data: ArchiveMission[] = paginatedResults.map(row => ({
      ...row,
      status: 'ARCHIVED' as const,
      questCount: Number(row.questCount),
      avgSatisfaction: row.avgSatisfaction ? Number(row.avgSatisfaction) : null,
    }));

    const pagination: PaginationState = {
      page,
      pageSize,
      totalCount,
      totalPages,
    };

    return { data, pagination };
  });
}

/**
 * Get missions that have archived quests (for filter dropdown)
 */
export async function getMissionsWithArchivedQuests(
  userId: string,
  searchQuery?: string
): Promise<Array<{ id: string; title: string }>> {
  return safeServerAction(async () => {
    const conditions = [eq(missions.userId, userId)];

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`;
      conditions.push(ilike(missions.title, searchTerm));
    }

    const results = await db
      .selectDistinct({
        id: missions.id,
        title: missions.title,
      })
      .from(missions)
      .innerJoin(
        quests,
        and(
          eq(missions.id, quests.missionId),
          eq(quests.userId, userId),
          inArray(quests.status, ['COMPLETED', 'ARCHIVED'])
        )
      )
      .where(and(...conditions))
      .orderBy(missions.title);

    return results;
  });
}

/**
 * Get detailed mission information
 */
export async function getMissionDetails(userId: string, missionId: string) {
  return safeServerAction(async () => {
    // Get the mission details
    const [mission] = await db
      .select({
        id: missions.id,
        userId: missions.userId,
        title: missions.title,
        objective: missions.objective,
        status: missions.status,
        archivedAt: missions.archivedAt,
        createdAt: missions.createdAt,
        updatedAt: missions.updatedAt,
        afterActionReport: missions.afterActionReport,
        questCount: sql<number>`COUNT(${quests.id})`,
        avgSatisfaction: sql<number>`AVG(${quests.debriefSatisfaction})`,
        totalTime: sql<number>`COALESCE(SUM(${quests.actualTime}), 0)`,
      })
      .from(missions)
      .leftJoin(
        quests,
        and(
          eq(missions.id, quests.missionId),
          inArray(quests.status, ['COMPLETED', 'ARCHIVED'])
        )
      )
      .where(
        and(
          eq(missions.id, missionId),
          eq(missions.userId, userId),
          eq(missions.status, 'ARCHIVED')
        )
      )
      .groupBy(
        missions.id,
        missions.userId,
        missions.title,
        missions.objective,
        missions.status,
        missions.archivedAt,
        missions.createdAt,
        missions.updatedAt,
        missions.afterActionReport
      );

    if (!mission) {
      throw new NotFoundError(
        createErrorContext(userId, 'get_mission_details', 'mission', {
          missionId,
        })
      );
    }

    return {
      ...mission,
      status: 'ARCHIVED' as const,
      questCount: Number(mission.questCount),
      avgSatisfaction: mission.avgSatisfaction
        ? Number(mission.avgSatisfaction)
        : null,
      totalTime: Number(mission.totalTime),
    };
  });
}
