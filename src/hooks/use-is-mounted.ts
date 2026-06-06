'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the initial hydration render, then `true`
 * once mounted on the client. SSR-safe replacement for the
 * `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), [])`
 * pattern, which `react-hooks/set-state-in-effect` (react-hooks@7) flags.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
