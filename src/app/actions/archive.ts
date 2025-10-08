'use server';

import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { safeServerAction } from '@/lib/error-handler';
import {
  getArchivedQuests,
  getArchivedMissions,
  getMissionsWithArchivedQuests,
  getMissionDetails,
} from '@/lib/queries/archive';
import {
  questArchiveFiltersSchema,
  missionArchiveFiltersSchema,
  validateMissionId,
} from '@/lib/auth/validation';
import type {
  QuestArchiveRequest,
  MissionArchiveRequest,
  QuestArchiveResponse,
  MissionArchiveResponse,
} from '@/types/archive';

/**
 * Server action to get archived quests with filtering, sorting, and pagination
 */
export async function getArchivedQuestsAction(
  filters: QuestArchiveRequest
): Promise<QuestArchiveResponse> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'archive_read');

    // Validate filters
    const validatedFilters = questArchiveFiltersSchema.parse(filters);

    // Fetch archived quests data
    const result = await getArchivedQuests(userId, validatedFilters);

    return result;
  });
}

/**
 * Server action to get archived missions with filtering, sorting, and pagination
 */
export async function getArchivedMissionsAction(
  filters: MissionArchiveRequest
): Promise<MissionArchiveResponse> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'archive_read');

    // Validate filters
    const validatedFilters = missionArchiveFiltersSchema.parse(filters);

    // Fetch archived missions data
    const result = await getArchivedMissions(userId, validatedFilters);

    return result;
  });
}

/**
 * Server action to get missions that have archived quests (for filter dropdown)
 */
export async function getMissionsWithArchivedQuestsAction(): Promise<
  Array<{ id: string; title: string }>
> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'archive_read');

    // Fetch missions with archived quests
    const missions = await getMissionsWithArchivedQuests(userId);

    return missions;
  });
}

/**
 * Server action to get detailed mission information with quests
 */
export async function getMissionDetailsAction(missionId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'archive_read');

    // Validate input
    const validated = validateMissionId({ missionId });

    // Fetch mission details with quests
    const missionDetails = await getMissionDetails(userId, validated.missionId);

    return missionDetails;
  });
}
