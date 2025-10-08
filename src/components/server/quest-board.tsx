import { getKanbanQuests } from '@/lib/queries/quests';
import { QuestBoardClient } from '@/components/quest-board-client';

export async function QuestBoardServer() {
  // Fetch all required data for proper hydration
  const quests = await getKanbanQuests();

  return <QuestBoardClient initialQuests={quests} />;
}
