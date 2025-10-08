import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';
import { EnhancedArchiveSkeleton } from '@/components/archive/loading-states';
import { ArchiveLayout } from '@/components/archive/archive-layout';

export default async function ArchivePage() {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <main className="ml-0 md:ml-64 pt-[52px] sm:pt-[56px] md:pt-[60px] min-h-screen">
      <div className="p-4 md:p-6 space-y-6">
        <Suspense fallback={<EnhancedArchiveSkeleton />}>
          <DataErrorBoundary context="archive data">
            <ArchiveLayout />
          </DataErrorBoundary>
        </Suspense>
      </div>
    </main>
  );
}
