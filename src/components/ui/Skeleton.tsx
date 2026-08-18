import { cn } from '../../lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('cj-skeleton', className)} aria-hidden />;
}

export function JobCardSkeleton() {
  return (
    <div className="cj-card p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
