import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Briefcase } from 'lucide-react';
import { searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { Button } from '../components/ui/Button';
import { LOCATIONS } from '../lib/config';
import { formatDistanceToNow } from 'date-fns';

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
      .catch((err) => {
        console.error(err);
        setError('Unable to load jobs. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [q, location, page]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const newQ = (form.get('q') as string) || '';
    const newLoc = (form.get('location') as string) || '';
    if (newQ) params.set('q', newQ);
    if (newLoc && newLoc !== 'All Nepal') params.set('location', newLoc);
    setSearchParams(params);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Jobs</h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search jobs, skills or positions"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-[#0066FF] outline-none"
          />
        </div>
        <select
          name="location"
          defaultValue={location}
          className="h-11 px-3 rounded-lg border border-gray-300 bg-white"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <Button type="submit">Search</Button>
      </form>

      {loading && (
        <div className="text-center py-16 text-gray-500">Loading jobs…</div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-2">No jobs found.</p>
          <p className="text-sm text-gray-500 mb-4">Try another search or location.</p>
          <Link to="/jobs"><Button variant="outline">Search Again</Button></Link>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} job{total !== 1 ? 's' : ''} found</p>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block p-5 rounded-xl border border-gray-200 hover:border-[#0066FF]/40 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location_detail ? `${job.location_detail}, ${job.location}` : job.location}
                      </span>
                      {job.job_categories?.name && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.job_categories.name}
                        </span>
                      )}
                      {job.published_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.salary_display && (
                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded">
                          {job.salary_display}
                        </span>
                      )}
                      <span className="text-sm text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded capitalize">
                        {job.job_type.replace('-', ' ')}
                      </span>
                      {job.experience_required && (
                        <span className="text-sm text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded">
                          {job.experience_required}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0 self-start">View Job</Button>
                </div>
              </Link>
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
