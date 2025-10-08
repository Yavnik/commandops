export function ArchiveSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-lg"></div>
            <div>
              <div className="h-5 sm:h-6 bg-gray-700 rounded w-32 mb-1"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-48"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div className="h-3 bg-gray-700 rounded w-24"></div>
      </div>

      {/* View toggle skeleton */}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded-lg w-full max-w-md"></div>
      </div>

      {/* Filters skeleton */}
      <div className="animate-pulse">
        <div className="h-16 bg-gray-700 rounded-lg w-full"></div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-700 rounded w-full"></div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-700 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}
