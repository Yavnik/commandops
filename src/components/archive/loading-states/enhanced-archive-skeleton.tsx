'use client';

export function EnhancedArchiveSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tabs-border rounded-lg shimmer-loading" />
            <div className="space-y-2">
              <div className="h-6 bg-tabs-border rounded shimmer-loading w-48" />
              <div className="h-4 bg-tabs-border/70 rounded shimmer-loading w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tabs-border rounded shimmer-loading" />
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-20" />
          </div>
        </div>
        <div className="h-3 bg-tabs-border/50 rounded shimmer-loading w-32" />
      </div>

      {/* View toggle skeleton */}
      <div className="flex bg-tabs-bg border border-tabs-border rounded-lg p-1 w-fit">
        <div className="h-8 bg-tabs-border rounded shimmer-loading w-24 mr-1" />
        <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-24" />
      </div>

      {/* Filters skeleton */}
      <div className="bg-tabs-bg border border-tabs-border rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search filter */}
          <div className="space-y-2 sm:col-span-2">
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-20" />
            <div className="h-10 bg-tabs-border/50 rounded shimmer-loading w-full" />
          </div>

          {/* Date range filter */}
          <div className="space-y-2">
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-16" />
            <div className="h-10 bg-tabs-border/50 rounded shimmer-loading w-full" />
          </div>

          {/* Mission filter */}
          <div className="space-y-2">
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-14" />
            <div className="h-10 bg-tabs-border/50 rounded shimmer-loading w-full" />
          </div>

          {/* Satisfaction filter */}
          <div className="space-y-2">
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-18" />
            <div className="h-10 bg-tabs-border/50 rounded shimmer-loading w-full" />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2">
            <div className="h-10 bg-primary-accent/30 rounded shimmer-loading w-20" />
            <div className="h-10 bg-tabs-border/50 rounded shimmer-loading w-16" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-tabs-bg border border-tabs-border rounded-lg overflow-hidden">
        <div className="p-4">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-4 pb-3 border-b border-tabs-border">
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-12" />
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-16 col-span-2" />
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-14" />
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-16" />
            <div className="h-4 bg-tabs-border rounded shimmer-loading w-10" />
          </div>

          {/* Table rows */}
          <div className="space-y-4 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center">
                {/* Status indicator */}
                <div className="flex justify-center">
                  <div className="w-3 h-3 bg-tabs-border rounded-full shimmer-loading" />
                </div>

                {/* Title (spans 2 columns) */}
                <div className="col-span-2 space-y-1">
                  <div className="h-4 bg-tabs-border rounded shimmer-loading w-full" />
                  <div className="h-3 bg-tabs-border/50 rounded shimmer-loading w-3/4" />
                </div>

                {/* Mission/Date */}
                <div className="h-4 bg-tabs-border/70 rounded shimmer-loading w-full" />

                {/* Time/Count */}
                <div className="h-4 bg-tabs-border/70 rounded shimmer-loading w-16" />

                {/* Rating/Actions */}
                <div className="flex justify-center">
                  <div className="w-6 h-6 bg-tabs-border rounded shimmer-loading" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between bg-tabs-bg border border-tabs-border rounded-lg px-4 py-3">
        <div className="h-4 bg-tabs-border rounded shimmer-loading w-32" />
        <div className="flex items-center gap-2">
          <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-8" />
          <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-8" />
          <div className="h-4 bg-tabs-border rounded shimmer-loading w-16" />
          <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-8" />
          <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-8" />
        </div>
        <div className="h-8 bg-tabs-border/50 rounded shimmer-loading w-24" />
      </div>
    </div>
  );
}
