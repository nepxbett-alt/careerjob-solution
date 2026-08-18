import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { Button } from '../components/ui/Button';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { LOCATIONS } from '../lib/config';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get('q') || '';
  const location = searchParams.get('location') || 'Pokhara';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchJobs({ q, location, page })
      .then(({ jobs, total }) => {
        setJobs(jobs);
        setTotal(total);
      })
      .catch(() => setError("We couldn't load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, [q, location, page]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const newQ = ((form.get('q') as string) || '').trim();
    const newLoc = (form.get('location') as string) || '';
    if (newQ) params.set('q', newQ);
    if (newLoc && newLoc !== 'All Nepal') params.set('location', newLoc);
    setSearchParams(params);
  };

  return (
    <div className="cj-container cj-page max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Find jobs</h1>
      <p className="text-sm text-slate-500 mb-6">Search roles across Pokhara and Nepal. CareerJob reviews every application.</p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-8" role="search">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" aria-hidden />
          <label htmlFor="jobs-q" className="sr-only">Search</label>
          <input
            id="jobs-q"
            name="q"
            defaultValue={q}
            placeholder="Job title, skill or keyword"
            className="cj-input pl-10"
          />
        </div>
        <label htmlFor="jobs-loc" className="sr-only">Location</label>
        <select id="jobs-loc" name="location" defaultValue={location} className="cj-input sm:w-44">
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <Button type="submit" className="sm:w-auto">Search</Button>
      </form>

      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading jobs">
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
          title="No jobs found"
          description="Try another keyword or location. You can also message CareerJob on WhatsApp for help."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setSearchParams({})}>Clear filters</Button>
              <Link to="/contact"><Button>Contact us</Button></Link>
            </div>
          }
        />
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4" aria-live="polite">
            {total} job{total !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', String(page - 1));
                    setSearchParams(p);
                  }}
                >
                  Previous
                </Button>
              )}
              {page * 20 < total && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', String(page + 1));
                    setSearchParams(p);
                  }}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
