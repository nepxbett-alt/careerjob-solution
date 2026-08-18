import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-14 px-4', className)}>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">{description}</p>}
      {action}
    </div>
  );
}
