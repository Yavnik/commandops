'use client';

interface SystemStatusProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SystemStatus({
  className = '',
  size = 'md',
}: SystemStatusProps) {
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${textSizes[size]} ${className}`}>
      <span
        className="animate-pulse"
        style={{
          color: 'var(--color-success, rgb(34, 197, 94))',
        }}
      >
        ●
      </span>
      <span
        className="uppercase tracking-wider"
        style={{
          color: 'var(--color-accent-text, rgb(6, 182, 212))',
        }}
      >
        System: ONLINE
      </span>
    </div>
  );
}
