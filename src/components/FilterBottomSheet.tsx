import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';
import { POKHARA_AREAS } from '../lib/config';

export const JOB_TYPE_OPTIONS = [
  { value: '', label: 'Any type' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  area: string;
  jobType: string;
  onApply: (next: { area?: string; type?: string }) => void;
  onClear: () => void;
}

/** Mobile-first filter sheet for Jobs page */
export function FilterBottomSheet({
  open,
  onClose,
  area,
  jobType,
  onApply,
  onClear,
}: FilterBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Job filters">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl safe-bottom">
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <h2 className="font-semibold text-slate-900">Filters</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-50 min-h-[44px] min-w-[44px]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Area in Pokhara</p>
            <div className="flex flex-wrap gap-2">
              {POKHARA_AREAS.map((a) => {
                const active = a === 'All Pokhara' ? !area || area === 'All Pokhara' : area === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onApply({ area: a === 'All Pokhara' ? undefined : a, type: jobType || undefined })}
                    className={cn(
                      'px-3 py-2 rounded-full text-sm font-medium border min-h-[40px]',
                      active
                        ? 'bg-[#0066FF] text-white border-[#0066FF]'
                        : 'bg-white text-slate-700 border-slate-200',
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Employment type</p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_OPTIONS.map((t) => {
                const active = (jobType || '') === t.value;
                return (
                  <button
                    key={t.value || 'any'}
                    type="button"
                    onClick={() =>
                      onApply({
                        area: area && area !== 'All Pokhara' ? area : undefined,
                        type: t.value || undefined,
                      })
                    }
                    className={cn(
                      'px-3 py-2 rounded-full text-sm font-medium border min-h-[40px]',
                      active
                        ? 'bg-[#0066FF] text-white border-[#0066FF]'
                        : 'bg-white text-slate-700 border-slate-200',
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 px-4 py-3 border-t border-slate-100 bg-white">
          <Button type="button" variant="outline" className="flex-1" onClick={onClear}>
            Clear all
          </Button>
          <Button type="button" className="flex-1" onClick={onClose}>
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
}
