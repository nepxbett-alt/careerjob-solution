import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { Button } from '../components/ui/Button';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/Seo';
import { POKHARA_AREAS, JOB_TYPES } from '../lib/config';
import { cn } from '../lib/cn';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const area = searchParams.get('area') || '';
  const jobType = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Pokhara-area agency inventory: do not require literal "Pokhara" in location strings.
    // Area chips filter by area name; "All Pokhara" returns the full published set.
    searchJobs({
      q: q || undefined,
      location: area && area !== 'All Pokhara' ? area : undefined,
      job_type: jobType || undefined,
      category: category || undefined,
      page,
      limit: 24,
    })
      .then(({ jobs, total }) => {
        setJobs(jobs);
        setTotal(total);
      })
      .catch(() => setError("We couldn't load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, [q, area, jobType, category, page]);

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    if ('q' in patch || 'area' in patch || 'type' in patch || 'category' in patch) next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newQ = ((form.get('q') as string) || '').trim();
    updateParams({ q: newQ || undefined, area: area || undefined, type: jobType || undefined });
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const hasFilters = !!q || (!!area && area !== 'All Pokhara') || !!jobType || !!category;

  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo
        title="Jobs in Pokhara | CareerJob Solution"
        description="Find jobs in Pokhara. Apply simply — CareerJob reviews every application."
        canonical="https://careerjobsolution.com.np/jobs"
      />

      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl py-3 sm:py-4">
          <form onSubmit={handleSearch} className="flex gap-2" role="search">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#98A2B3] pointer-events-none" aria-hidden />
              <label htmlFor="jobs-q" className="sr-only">Search jobs in Pokhara</label>
              <input
                id="jobs-q"
                name="q"
                defaultValue={q}
                key={q}
                placeholder="Job title or skill in Pokhara"
                className="cj-input pl-11 h-12 rounded-xl bg-white shadow-sm"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="h-12 px-5 rounded-xl shrink-0">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-xl shrink-0 px-0"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filters"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </form>

          {/* Pokhara area chips only */}
          <div className="flex gap-2 overflow-x-auto pt-3 pb-0.5 -mx-1 px-1 scrollbar-none">
            {POKHARA_AREAS.map((a) => {
              const active = a === 'All Pokhara' ? !area || area === 'All Pokhara' : area === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    updateParams({
                      area: a === 'All Pokhara' ? undefined : a,
                      q: q || undefined,
                      type: jobType || undefined,
                    })
                  }
                  className={cn(
                    'shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-all min-h-[40px]',
                    active
                      ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-sm shadow-blue-600/20'
                      : 'bg-white text-[#3D4A5C] border-[#E8ECF1] hover:border-[#0066FF]/35'
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>

          {showFilters && (
            <div className="mt-3 p-4 rounded-2xl border border-[#E8ECF1] bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0B1220]">Job type</p>
                <button type="button" onClick={() => setShowFilters(false)} className="p-1 text-[#6B7789]" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParams({ type: undefined, q: q || undefined, area: area || undefined })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px]',
                    !jobType ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white border-[#E8ECF1] text-[#3D4A5C]'
                  )}
                >
                  Any
                </button>
                {JOB_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateParams({ type: t.value, q: q || undefined, area: area || undefined })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px]',
                      jobType === t.value
                        ? 'bg-[#0066FF] text-white border-[#0066FF]'
                        : 'bg-white border-[#E8ECF1] text-[#3D4A5C]'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {hasFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="cj-container max-w-3xl py-6 pb-16">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0B1220]">Jobs in Pokhara</h1>
            {!loading && !error && (
              <p className="text-sm text-[#6B7789]" aria-live="polite">
                {total} opening{total !== 1 ? 's' : ''}
                {q ? ` for “${q}”` : ''}
                {area && area !== 'All Pokhara' ? ` · ${area}` : ''}
              </p>
            )}
          </div>
          {category && (
            <p className="text-sm text-[#6B7789] mb-2">
              Filtered by category ·{' '}
              <button type="button" className="text-[#0066FF] font-medium" onClick={() => updateParams({ category: undefined })}>
                Clear category
              </button>
            </p>
          )}
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-sm font-medium text-[#0066FF]">
              Reset
            </button>
          )}
        </div>

        {loading && (
          <div className="space-y-3" aria-busy="true">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        )}

        {error && !loading && (
          <EmptyState
            title="Couldn't load jobs"
            description={error}
            action={<Button onClick={() => window.location.reload()}>Try again</Button>}
          />
        )}

        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            title={
              area && area !== 'All Pokhara' && area !== 'Pokhara'
                ? `No jobs in ${area} right now`
                : q
                  ? `No jobs matching “${q}”`
                  : 'No open jobs right now'
            }
            description={
              hasFilters
                ? 'Try All Pokhara, clear filters, or check back soon — new roles are added regularly.'
                : 'New roles are added often. Message CareerJob on WhatsApp or check back soon.'
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {hasFilters && (
                  <Button variant="outline" onClick={clearAll}>
                    Clear filters
                  </Button>
                )}
                <Link to="/contact">
                  <Button variant={hasFilters ? 'primary' : 'outline'}>Contact us</Button>
                </Link>
              </div>
            }
          />
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
