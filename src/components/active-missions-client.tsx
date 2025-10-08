'use client';

import React from 'react';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { MissionView } from '@/components/mission-view';
import { MissionsSkeleton } from '@/components/skeletons/missions-skeleton';

/**
 * Client component for the missions page.
 * It reads mission data directly from the global store,
 * and displays a skeleton while the data is loading.
 */
export const ActiveMissionsClient = React.memo(function ActiveMissionsClient() {
  const { isLoading } = useCommandOpsStore();

  // Display a skeleton loader while the initial mission fetch is in progress.
  if (isLoading.missions) {
    return <MissionsSkeleton />;
  }

  // MissionView reads from the store itself.
  return <MissionView />;
});
