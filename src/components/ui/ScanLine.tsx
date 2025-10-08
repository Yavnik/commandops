'use client';

import { usePathname } from 'next/navigation';

export function ScanLine() {
  const pathname = usePathname();

  // Hide scan line when on focus mode pages
  const isFocusMode = pathname?.startsWith('/focus');

  return (
    <div
      className={`scan-line ${isFocusMode ? 'opacity-0 pointer-events-none' : ''}`}
    />
  );
}
