import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Briefcase, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import {
  searchJobs,
  getCategoriesWithCounts,
  getPokharaAreaCounts,
} from '../services/jobService';
import type { Job, CategoryCount, AreaCount } from '../services/jobService';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';

/**
 * Candidate-first homepage: search → categories → areas → latest jobs.
 * Real Supabase data only. No employer CTAs, no marketing fluff.
 */
export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

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
      getCategoriesWithCounts().catch(() => [] as CategoryCount[]),
      getPokharaAreaCounts().catch(() => [] as AreaCount[]),
    ])
      .then(([latestRes, cats, areaCounts]) => {
        setLatest(latestRes.jobs || []);
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
    <div className="bg-white min-h-[60vh]">
      <Seo
        title="Find Jobs in Nepal | CareerJob Solution"
        description="Find the latest job opportunities in Nepal by category and location. Explore salary, requirements and apply on CareerJob Solution."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* Compact search hero */}
      <section className="border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-3xl pt-8 pb-6 md:pt-10 md:pb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1220] text-center mb-2">
            Find your next job in Nepal
          </h1>
          <p className="text-sm sm:text-base text-[#6B7789] text-center mb-5 max-w-md mx-auto">
            Explore verified opportunities by category and location.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto" role="search">
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
              className="w-full h-12 sm:h-13 pl-11 pr-4 rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] text-[#0B1220] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]/40 focus:bg-white transition-shadow"
              autoComplete="off"
              enterKeyHint="search"
            />
          </form>
        </div>
      </section>

      <div className="cj-container max-w-3xl py-8 md:py-10 space-y-10 md:space-y-12">
        {/* Categories */}
        <section id="categories" aria-labelledby="cat-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="cat-heading" className="text-lg font-bold tracking-tight text-[#0B1220]">
                Explore by category
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">Real open roles</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>

          {loading && categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[#F7F9FC] border border-[#E8ECF1] animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-[#6B7789]">Categories will appear when jobs are categorized.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  to={`/jobs?category=${c.id}`}
                  className="flex flex-col justify-center rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] hover:bg-white hover:border-[#0066FF]/35 px-3.5 py-3 transition-colors min-h-[64px]"
                >
                  <span className="text-sm font-semibold text-[#0B1220] leading-snug line-clamp-2">
                    {c.name}
                  </span>
                  <span className="text-xs text-[#6B7789] tabular-nums mt-0.5">
                    {c.count} {c.count === 1 ? 'job' : 'jobs'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Areas */}
        <section id="locations" aria-labelledby="area-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="area-heading" className="text-lg font-bold tracking-tight text-[#0B1220]">
                Jobs by area
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">From current vacancies</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>

          {loading && areas.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F7F9FC] border border-[#E8ECF1] animate-pulse" />
              ))}
            </div>
          ) : areas.length === 0 ? (
            <p className="text-sm text-[#6B7789]">Area filters will appear as jobs include location detail.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {areas.map((a) => (
                <Link
                  key={a.name}
                  to={`/jobs?area=${encodeURIComponent(a.name)}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#E8ECF1] bg-white hover:border-[#0066FF]/35 px-3.5 py-3 transition-colors min-h-[52px]"
                >
                  <span className="text-sm font-semibold text-[#0B1220] flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#0066FF] shrink-0" aria-hidden />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <span className="text-xs font-medium text-[#6B7789] tabular-nums shrink-0">
                    {a.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Latest jobs */}
        <section id="latest-jobs" aria-labelledby="jobs-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="jobs-heading" className="text-lg font-bold tracking-tight text-[#0B1220]">
                Latest jobs
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">Fresh opportunities added recently</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex flex-wrap items-center justify-between gap-2">
              <span>{error}</span>
              <Button type="button" size="sm" variant="outline" onClick={load}>
                Try again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : latest.length === 0 && !error ? (
            <div className="rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] px-4 py-10 text-center">
              <Briefcase className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" aria-hidden />
              <p className="font-medium text-[#0B1220]">No jobs available right now</p>
              <p className="text-sm text-[#6B7789] mt-1">Check back soon or explore another category.</p>
              <Link to="/jobs" className="inline-block mt-4 text-sm font-semibold text-[#0066FF]">
                Browse jobs
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {latest.length > 0 && (
            <div className="mt-6 text-center">
              <Link to="/jobs">
                <Button variant="outline" size="lg" className="rounded-xl">
                  View all jobs
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Compact CV CTA */}
        <section className="rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] px-4 py-5 sm:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-3 items-start">
            <FileText className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold text-[#0B1220] text-sm">Need a CV?</p>
              <p className="text-sm text-[#6B7789] mt-0.5">
                Create a professional CV and apply with confidence.
              </p>
            </div>
          </div>
          <Link to={user ? '/candidate/cv' : '/register'} className="shrink-0">
            <Button size="sm" variant="outline" className="rounded-xl w-full sm:w-auto">
              Create my CV
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
