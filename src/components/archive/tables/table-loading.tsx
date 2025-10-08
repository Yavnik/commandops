'use client';

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

export function TableLoading({ rows = 5, columns = 6 }: TableLoadingProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-tabs-border">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-tabs-border rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-tabs-border/30">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-tabs-border/50 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
