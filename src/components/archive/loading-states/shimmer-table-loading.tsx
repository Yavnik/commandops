'use client';

interface ShimmerTableLoadingProps {
  variant: 'quest' | 'mission';
  rows?: number;
}

export function ShimmerTableLoading({
  variant,
  rows = 5,
}: ShimmerTableLoadingProps) {
  const questColumns = [
    { key: 'status', width: 'w-20', content: 'circle' },
    { key: 'title', width: 'w-[40%]', content: 'text-long' },
    { key: 'mission', width: 'w-[20%]', content: 'text-medium' },
    { key: 'completed', width: 'w-[15%]', content: 'text-short' },
    { key: 'time', width: 'w-[10%]', content: 'text-short' },
    { key: 'rating', width: 'w-[10%]', content: 'circle' },
  ];

  const missionColumns = [
    { key: 'title', width: 'w-[25%]', content: 'text-long' },
    { key: 'objective', width: 'w-[30%]', content: 'text-long' },
    { key: 'archived', width: 'w-[15%]', content: 'text-short' },
    { key: 'quests', width: 'w-[10%]', content: 'text-short' },
    { key: 'satisfaction', width: 'w-[10%]', content: 'progress-bar' },
    { key: 'actions', width: 'w-[10%]', content: 'button' },
  ];

  const columns = variant === 'quest' ? questColumns : missionColumns;

  const renderSkeletonContent = (content: string) => {
    switch (content) {
      case 'circle':
        return (
          <div className="flex justify-center">
            <div className="w-3 h-3 bg-tabs-border rounded-full shimmer-loading" />
          </div>
        );
      case 'text-short':
        return (
          <div className="h-4 bg-tabs-border rounded shimmer-loading w-16" />
        );
      case 'text-medium':
        return (
          <div className="h-4 bg-tabs-border rounded shimmer-loading w-24" />
        );
      case 'text-long':
        return (
          <div className="h-4 bg-tabs-border rounded shimmer-loading w-32" />
        );
      case 'progress-bar':
        return (
          <div className="space-y-1">
            <div className="h-3 bg-tabs-border rounded shimmer-loading w-12" />
            <div className="h-1.5 bg-tabs-border rounded-full shimmer-loading w-full" />
          </div>
        );
      case 'button':
        return (
          <div className="h-6 bg-tabs-border rounded shimmer-loading w-20" />
        );
      default:
        return <div className="h-4 bg-tabs-border rounded shimmer-loading" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-tabs-border">
            {columns.map(column => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left ${column.width}`}
              >
                <div className="h-4 bg-tabs-border rounded shimmer-loading w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-tabs-border/30">
              {columns.map(column => (
                <td key={column.key} className="px-4 py-3">
                  {renderSkeletonContent(column.content)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
