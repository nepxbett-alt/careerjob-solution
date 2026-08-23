import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Briefcase } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import {
  searchJobs,
  getCategoriesWithCounts,
  getPokharaAreaCounts,
  getFeaturedJobs,
} from '../services/jobService';
import type { Job, CategoryCount, AreaCount } from '../services/jobService';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [latest, setLatest] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      searchJobs({ page: 1, limit: 12 }).catch(() => ({ jobs: [] as Job[] })),
      getFeaturedJobs(4).catch(() => [] as Job[]),
      getCategoriesWithCounts().catch(() => [] as CategoryCount[]),
      getPokharaAreaCounts().catch(() => [] as AreaCount[]),
    ])
      .then(([latestRes, featured, cats, areaCounts]) => {
        const feat = (featured || []).filter((j) => j.is_featured);
        const featIds = new Set(feat.map((j) => j.id));
        // Featured first, then latest non-featured
        const rest = (latestRes.jobs || []).filter((j) => !featIds.has(j.id));
        setLatest([...feat, ...rest].slice(0, 12));
        setCategories(cats || []);
        setAreas(areaCounts || []);
      })
      .catch(() => setError("Couldn't load jobs right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-[70vh]">
      <Seo
        title="Find Jobs in Nepal | CareerJob Solution"
        description="Find the latest job opportunities in Nepal by category and location. Explore jobs, requirements, salary and application details on CareerJob Solution."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* Compact search hero */}
      <section className="border-b border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container max-w-3xl py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1220] text-center">
            Find your next job in Nepal
          </h1>
          <p className="text-sm sm:text-base text-[#6B7789] text-center mt-2 mb-5">
            Explore verified opportunities by category and location.
          </p>

          <form onSubmit={handleSearch} role="search" className="relative max-w-xl mx-auto">
            <label htmlFor="home-search" className="sr-only">
              Search jobs
            </label>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3] pointer-events-none"
              aria-hidden
            />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, positions, companies…"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E8ECF1] bg-white text-[#0B1220] placeholder:text-[#98A2B3] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]/40"
              autoComplete="off"
            />
          </form>
        </div>
      </section>

      <div className="cj-container max-w-3xl py-8 sm:py-10 space-y-10">
        {/* Categories */}
        <section id="categories" aria-labelledby="home-categories">
          <div className="flex items-end justify-between gap-3 mb-4">
            <h2 id="home-categories" className="text-lg font-bold tracking-tight text-[#0B1220]">
              Explore by category
            </h2>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[#F7F9FC] animate-pulse border border-[#E8ECF1]" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-[#6B7789]">Categories will appear when jobs are published.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  to={`/jobs?category=${c.id}`}
                  className="flex flex-col justify-center rounded-xl border border-[#E8ECF1] bg-white px-3.5 py-3 hover:border-[#0066FF]/35 hover:shadow-sm transition-all min-h-[64px]"
                >
                  <span className="text-sm font-semibold text-[#0B1220] leading-snug line-clamp-2">{c.name}</span>
                  <span className="text-xs text-[#6B7789] tabular-nums mt-0.5">
                    {c.count} {c.count === 1 ? 'job' : 'jobs'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Areas */}
        <section id="areas" aria-labelledby="home-areas">
          <div className="flex items-end justify-between gap-3 mb-4">
            <h2 id="home-areas" className="text-lg font-bold tracking-tight text-[#0B1220]">
              Jobs by area
            </h2>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-28 rounded-full bg-[#F7F9FC] animate-pulse" />
              ))}
            </div>
          ) : areas.length === 0 ? (
            <p className="text-sm text-[#6B7789]">Area filters appear when jobs include location details.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Link
                  key={a.name}
                  to={`/jobs?area=${encodeURIComponent(a.name)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8ECF1] bg-white text-sm font-medium text-[#0B1220] hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors min-h-[40px]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#98A2B3]" aria-hidden />
                  {a.name}
                  <span className="text-[#6B7789] font-normal tabular-nums">{a.count}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Latest jobs */}
        <section aria-labelledby="home-latest">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="home-latest" className="text-lg font-bold tracking-tight text-[#0B1220]">
                Latest jobs
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">Fresh opportunities added recently.</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0 hidden sm:inline">
              View all jobs
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              {error}{' '}
              <button type="button" className="font-semibold underline" onClick={load}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : latest.length === 0 ? (
            <div className="rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] px-5 py-10 text-center">
              <Briefcase className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" aria-hidden />
              <p className="font-medium text-[#0B1220]">No jobs available right now</p>
              <p className="text-sm text-[#6B7789] mt-1">Check back soon or explore another category.</p>
              <Link to="/jobs" className="inline-block mt-4">
                <Button size="sm" variant="outline">
                  Browse jobs
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/jobs">
              <Button size="lg" className="rounded-xl">
                View all jobs
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>

        {/* Compact CV CTA */}
        <section className="rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-[#0B1220]">Need a CV?</p>
            <p className="text-sm text-[#6B7789] mt-0.5">Create a professional CV and apply with confidence.</p>
          </div>
          <Link to="/candidate/cv" className="shrink-0">
            <Button size="sm" variant="outline" className="rounded-xl">
              Create my CV
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
