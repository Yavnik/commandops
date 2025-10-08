export function StatsSkeleton() {
  return (
    <div className="mb-4 sm:mb-6">
      {/* Header skeleton */}
      <div className="h-4 bg-gray-700 rounded w-32 mb-2 sm:mb-3 animate-pulse"></div>

      {/* Mobile skeleton */}
      <div className="md:hidden">
        <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-700 h-20 rounded"></div>
        ))}
      </div>
    </div>
  );
}
