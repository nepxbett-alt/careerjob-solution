import { cn } from '../../lib/cn';

const STYLES: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-700',
  under_review: 'bg-sky-50 text-sky-800',
  shortlisted: 'bg-violet-50 text-violet-800',
  interview: 'bg-amber-50 text-amber-900',
  selected: 'bg-emerald-50 text-emerald-800',
  placed: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
  closed: 'bg-slate-100 text-slate-500',
  published: 'bg-emerald-50 text-emerald-800',
  draft: 'bg-slate-100 text-slate-600',
  paused: 'bg-amber-50 text-amber-800',
  submitted: 'bg-sky-50 text-sky-800',
  pending: 'bg-amber-50 text-amber-800',
  scheduled: 'bg-violet-50 text-violet-800',
  completed: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-500',
};

const LABELS: Record<string, string> = {
  applied: 'Applied',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  placed: 'Placed',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  closed: 'Closed',
  published: 'Published',
  draft: 'Draft',
  paused: 'Paused',
  submitted: 'Submitted',
  pending: 'Pending',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        STYLES[key] || 'bg-slate-100 text-slate-700',
        className
      )}
    >
      {LABELS[key] || status.replace(/_/g, ' ')}
    </span>
  );
}
