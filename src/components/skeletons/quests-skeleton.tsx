export function QuestsSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded w-[180px] sm:w-[200px] animate-pulse"></div>
      </div>

      {/* Kanban board skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-700 h-32 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
