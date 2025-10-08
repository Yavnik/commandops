'use client';

interface FilterLoadingProps {
  variant: 'quest' | 'mission';
}

export function FilterLoading({ variant }: FilterLoadingProps) {
  return (
    <div className="bg-tabs-bg border border-tabs-border rounded-lg p-4">
      <div className="flex items-center justify-center space-x-3 py-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary-accent rounded-full animate-bounce"></div>
        </div>
        <span className="text-secondary-text text-sm font-medium">
          {variant === 'quest'
            ? 'Applying quest filters...'
            : 'Applying mission filters...'}
        </span>
      </div>
    </div>
  );
}
