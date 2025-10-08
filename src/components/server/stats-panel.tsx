import { getQuestStats } from '@/lib/queries/quests';
import { getMissionStats } from '@/lib/queries/missions';
import { calculateAnalytics } from '@/lib/queries/analytics';
import { StatsPanelClient } from '@/components/stats-panel-client';

export async function StatsPanelServer() {
  // Fetch quest stats, mission stats, and analytics in parallel
  const [questStats, missionStats, analytics] = await Promise.all([
    getQuestStats(),
    getMissionStats(),
    calculateAnalytics(),
  ]);

  return (
    <StatsPanelClient
      questStats={questStats}
      missionStats={missionStats}
      analytics={analytics}
    />
  );
}
