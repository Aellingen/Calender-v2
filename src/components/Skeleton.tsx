interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-[var(--r-md)] animate-shimmer ${className}`}
    />
  );
}

export function GoalCardSkeleton() {
  return (
    <div
      className="h-[220px] rounded-[var(--r-xl)] overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="w-[52px] h-[52px] rounded-full" />
        </div>
        <Skeleton className="h-[5px] w-full rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ActionCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <Skeleton className="w-5 h-5 rounded-full" />
      <Skeleton className="w-12 h-4" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function HabitCircleSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1">
      <Skeleton className="w-12 h-12 rounded-full" />
      <Skeleton className="w-10 h-3" />
    </div>
  );
}
