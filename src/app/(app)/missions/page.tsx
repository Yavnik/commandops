import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';
import { ActiveMissionsClient } from '@/components/active-missions-client';
import { MissionsSkeleton } from '@/components/skeletons/missions-skeleton';

export default async function MissionsPage() {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <main className="ml-0 md:ml-64 pt-[52px] sm:pt-[56px] md:pt-[60px] min-h-screen transition-all duration-300 overflow-x-hidden max-w-full">
      <div className="p-4 md:p-6">
        <Suspense fallback={<MissionsSkeleton />}>
          <DataErrorBoundary context="missions management">
            <ActiveMissionsClient />
          </DataErrorBoundary>
        </Suspense>
      </div>
    </main>
  );
}
