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
    <div
      className={cn(
        'text-center py-14 px-4 rounded-2xl border border-[#E8ECF1] bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04)]',
        className,
      )}
    >
      <h3 className="text-base font-semibold text-[#0B1220] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B7789] max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
