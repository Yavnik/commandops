export function MissionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-20 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Missions grid skeleton */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-700 h-24 rounded"></div>
        ))}
      </div>
    </div>
  );
}
