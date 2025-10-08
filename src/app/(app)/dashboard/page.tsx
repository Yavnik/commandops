import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { StatsPanelServer } from '@/components/server/stats-panel';
import { QuestBoardServer } from '@/components/server/quest-board';
import { StatsSkeleton } from '@/components/skeletons/stats-skeleton';
import { QuestsSkeleton } from '@/components/skeletons/quests-skeleton';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

export default async function DashboardPage() {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <main className="ml-0 md:ml-64 pt-[52px] sm:pt-[56px] md:pt-[60px] h-screen transition-all duration-300 overflow-hidden max-w-full flex flex-col">
      <div className="p-3 sm:p-4 md:p-6 relative z-10 flex-shrink-0">
        {/* Performance Stats Section */}
        <Suspense fallback={<StatsSkeleton />}>
          <DataErrorBoundary context="performance statistics">
            <StatsPanelServer />
          </DataErrorBoundary>
        </Suspense>
      </div>

      {/* Quest Board Section - Takes remaining height */}
      <div className="flex-1 overflow-hidden px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <Suspense fallback={<QuestsSkeleton />}>
          <DataErrorBoundary context="quest board">
            <QuestBoardServer />
          </DataErrorBoundary>
        </Suspense>
      </div>
    </main>
  );
}
