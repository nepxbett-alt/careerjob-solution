import { cn } from '../../lib/cn';

const STYLES: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80',
  under_review: 'bg-sky-50 text-sky-800 ring-1 ring-sky-100',
  shortlisted: 'bg-violet-50 text-violet-800 ring-1 ring-violet-100',
  interview: 'bg-amber-50 text-amber-900 ring-1 ring-amber-100',
  selected: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  placed: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-100',
  withdrawn: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
  closed: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
  published: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  draft: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80',
  paused: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  submitted: 'bg-sky-50 text-sky-800 ring-1 ring-sky-100',
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  scheduled: 'bg-violet-50 text-violet-800 ring-1 ring-violet-100',
  completed: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  cancelled: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
  active: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  employed: 'bg-sky-50 text-sky-800 ring-1 ring-sky-100',
  inactive: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
  passive: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  invoiced: 'bg-violet-50 text-violet-800 ring-1 ring-violet-100',
  paid: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  approaching: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  hired: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
  left: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
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
  active: 'Active seeker',
  employed: 'Employed',
  inactive: 'Inactive',
  passive: 'Passive',
  pending: 'Pending',
  invoiced: 'Invoiced',
  paid: 'Paid',
  approaching: 'Approaching',
  hired: 'Hired',
  left: 'Left',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight',
        STYLES[key] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80',
        className
      )}
    >
      {LABELS[key] || status.replace(/_/g, ' ')}
    </span>
  );
}
