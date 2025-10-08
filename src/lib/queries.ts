/**
 * @deprecated This file is deprecated. Import directly from specific query modules:
 * - @/lib/queries/missions
 * - @/lib/queries/quests
 * - @/lib/queries/commander
 * - @/lib/queries/archive
 */

// Re-exports for backward compatibility
export {
  getQuestStats,
  getPlanningQuests,
  getActiveQuests,
  getCompletedQuests,
  getKanbanQuests,
  getQuestsByMission,
  getArchivedQuests,
  getQuestsByStatus,
  getQuestById,
  getActiveQuestCount,
} from '@/lib/queries/quests';

export {
  getActiveMissions,
  getArchivedMissions,
  getAllMissions,
  getMissionById,
  getMissionProgress,
  getMissionsForFilter,
  searchMissions,
  getMissionStats,
} from '@/lib/queries/missions';

export { getCommanderData, getCurrentUser } from '@/lib/queries/commander';
