'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { posthogCapture, posthogIdentify } from '@/lib/posthog-utils';

/**
 * This component is responsible for initializing the command ops store
 * with essential, global data, like missions and commander. It runs once on app load
 * and re-initializes during hot reloads when the store is recreated.
 */
export function StoreInitializer() {
  const { fetchMissions, fetchCommander, missions, commander } =
    useCommandOpsStore();
  const initialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check for corrupted state (undefined values instead of empty arrays/objects)
    const hasCorruptedState =
      missions === undefined ||
      commander === undefined ||
      (commander && commander.id === undefined);

    // Enhanced corruption detection
    const hasArrayCorruption =
      Array.isArray(missions) &&
      missions.some(m => m === undefined || m === null);
    const hasCommanderCorruption =
      commander &&
      (typeof commander !== 'object' ||
        commander.id === undefined ||
        commander.username === undefined);

    // Check if we need to initialize or re-initialize (e.g., after hot reload)
    // Only fetch if data is truly empty (not already initialized by server components)
    const needsInitialization =
      !initialized.current ||
      hasCorruptedState ||
      hasArrayCorruption ||
      hasCommanderCorruption ||
      ((missions || []).length === 0 && (commander?.id || '') === '');

    if (needsInitialization) {
      // Enhanced corruption logging
      if (hasCorruptedState || hasArrayCorruption || hasCommanderCorruption) {
        // Force reinitialize
        initialized.current = false;
      }

      // Only fetch missions if not already populated or corrupted
      if (
        !missions ||
        (missions || []).length === 0 ||
        missions === undefined
      ) {
        fetchMissions();
      }
      // Only fetch commander if not already populated or corrupted
      if (
        !commander ||
        (commander?.id || '') === '' ||
        commander === undefined
      ) {
        fetchCommander();
      }
      initialized.current = true;
    }
  }, [fetchMissions, fetchCommander, missions, commander]);

  // Identify user in PostHog when commander is loaded
  useEffect(() => {
    if (commander.id && commander.id !== '') {
      posthogIdentify(commander.id, {
        username: commander.username,
        email: commander.email,
      });
    }
  }, [commander]);

  // Track page navigation
  useEffect(() => {
    posthogCapture('page_view', {
      path: pathname,
      referrer: document.referrer,
    });
  }, [pathname]);

  return null; // This component renders nothing.
}
