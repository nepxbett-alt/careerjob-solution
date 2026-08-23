import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  Utensils,
  Car,
  Building2,
  GraduationCap,
  ShoppingBag,
  Wrench,
  HeartPulse,
  Monitor,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import {
  searchJobs,
  getFeaturedJobs,
  getCategoriesWithCounts,
  getPokharaAreaCounts,
  getPublishedJobCount,
} from '../services/jobService';
import type { Job, CategoryCount, AreaCount } from '../services/jobService';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';
import { CONTACT } from '../lib/config';

const CATEGORY_ICONS: Record<string, typeof Briefcase> = {
  'hotel-restaurant': Utensils,
  hospitality: Utensils,
  driving: Car,
  'office-administration': Building2,
  education: GraduationCap,
  sales: ShoppingBag,
  marketing: Sparkles,
  retail: ShoppingBag,
  cleaning: Sparkles,
  security: Shield,
  'it-technology': Monitor,
  healthcare: HeartPulse,
  construction: Wrench,
  other: Briefcase,
};

/**
 * Polished candidate-first homepage.
 * Search → categories → areas → jobs. Real data only.
 */
export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getFeaturedJobs(4).catch(() => [] as Job[]),
      searchJobs({ page: 1, limit: 10 }).catch(() => ({ jobs: [] as Job[] })),
      getCategoriesWithCounts().catch(() => [] as CategoryCount[]),
      getPokharaAreaCounts().catch(() => [] as AreaCount[]),
      getPublishedJobCount().catch(() => 0),
    ])
      .then(([feat, latestRes, cats, areaCounts, count]) => {
        const featList = (feat || []).filter((j) => j.is_featured);
        setFeatured(featList);
        const featIds = new Set(featList.map((j) => j.id));
        setLatest((latestRes.jobs || []).filter((j) => !featIds.has(j.id)).slice(0, 8));
        setCategories(cats || []);
        setAreas(areaCounts || []);
        setJobCount(count || 0);
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

  const quickTerms = categories.slice(0, 6).map((c) => ({
    label: c.name,
    to: `/jobs?category=${c.id}`,
  }));

  return (
    <div className="bg-[#F7F9FC] min-h-[60vh]">
      <Seo
        title="Find Jobs in Nepal | CareerJob Solution"
        description="Find the latest job opportunities in Pokhara and Nepal. Browse by category and location, see salary and requirements, and apply through CareerJob Solution."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* Hero + search */}
      <section className="relative border-b border-[#E8ECF1] bg-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,102,255,0.07),transparent_55%)]"
          aria-hidden
        />
        <div className="cj-container relative max-w-3xl pt-9 pb-7 md:pt-12 md:pb-10">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#0066FF] mb-2">
            CareerJob Solution · Pokhara
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[2.15rem] font-bold tracking-tight text-[#0B1220] text-center mb-2">
            Find your next job in Nepal
          </h1>
          <p className="text-sm sm:text-[0.95rem] text-[#6B7789] text-center mb-6 max-w-md mx-auto leading-relaxed">
            Browse real openings by category and area. See salary and requirements — apply in minutes.
          </p>

          <form
            onSubmit={handleSearch}
            className="relative max-w-xl mx-auto"
            role="search"
          >
            <label htmlFor="home-search" className="sr-only">
              Search jobs
            </label>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3] pointer-events-none"
              aria-hidden
            />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job title, skill, or company…"
              className="w-full h-12 sm:h-[3.25rem] pl-12 pr-4 rounded-2xl border border-[#E8ECF1] bg-white text-[#0B1220] placeholder:text-[#98A2B3] shadow-[0_4px_24px_rgba(11,18,32,0.06)] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25 focus:border-[#0066FF]/40 transition-shadow"
              autoComplete="off"
              enterKeyHint="search"
            />
          </form>

          {jobCount != null && jobCount > 0 && (
            <p className="text-center text-sm text-[#6B7789] mt-3 tabular-nums">
              <span className="font-semibold text-[#0B1220]">{jobCount}</span> open roles right now
            </p>
          )}

          {quickTerms.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {quickTerms.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F7F9FC] border border-[#E8ECF1] text-[#3D4A5C] hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="cj-container max-w-3xl py-8 md:py-11 space-y-10 md:space-y-12">
        {/* Categories */}
        <section id="categories" aria-labelledby="cat-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="cat-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220]">
                Browse by category
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">Tap a category to see matching jobs</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              All jobs
            </Link>
          </div>

          {loading && categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[4.5rem] rounded-2xl bg-white border border-[#E8ECF1] animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? null : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.slice(0, 12).map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] || Briefcase;
                return (
                  <Link
                    key={c.id}
                    to={`/jobs?category=${c.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-[#E8ECF1] bg-white hover:border-[#0066FF]/35 hover:shadow-[0_4px_16px_rgba(11,18,32,0.05)] px-3.5 py-3.5 transition-all min-h-[72px]"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#0066FF] shrink-0 group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0B1220] leading-snug line-clamp-2 group-hover:text-[#0066FF] transition-colors">
                        {c.name}
                      </span>
                      <span className="block text-xs text-[#6B7789] tabular-nums mt-0.5">
                        {c.count} {c.count === 1 ? 'job' : 'jobs'}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Areas */}
        {areas.length > 0 && (
          <section id="locations" aria-labelledby="area-heading">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 id="area-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220]">
                  Jobs by area
                </h2>
                <p className="text-sm text-[#6B7789] mt-0.5">Pokhara locations with open roles</p>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
                All areas
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Link
                  key={a.name}
                  to={`/jobs?area=${encodeURIComponent(a.name)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8ECF1] bg-white hover:border-[#0066FF]/40 hover:text-[#0066FF] px-3.5 py-2 text-sm font-medium text-[#0B1220] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0066FF] shrink-0" aria-hidden />
                  {a.name}
                  <span className="text-xs text-[#6B7789] tabular-nums font-normal">{a.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section aria-labelledby="feat-heading">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 id="feat-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220]">
                  Featured roles
                </h2>
                <p className="text-sm text-[#6B7789] mt-0.5">Highlighted by CareerJob</p>
              </div>
            </div>
            <div className="grid gap-3">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Latest jobs */}
        <section id="latest-jobs" aria-labelledby="jobs-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="jobs-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220]">
                Latest jobs
              </h2>
              <p className="text-sm text-[#6B7789] mt-0.5">Recently published openings</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              View all
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex flex-wrap items-center justify-between gap-2 mb-4">
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
          ) : latest.length === 0 && featured.length === 0 && !error ? (
            <div className="rounded-2xl border border-[#E8ECF1] bg-white px-4 py-12 text-center">
              <Briefcase className="w-9 h-9 text-[#98A2B3] mx-auto mb-3" aria-hidden />
              <p className="font-semibold text-[#0B1220]">No jobs available right now</p>
              <p className="text-sm text-[#6B7789] mt-1 max-w-xs mx-auto">
                New roles are added regularly. Check back soon or message CareerJob on WhatsApp.
              </p>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                className="inline-block mt-4 text-sm font-semibold text-[#0066FF]"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp CareerJob
              </a>
            </div>
          ) : (
            <div className="grid gap-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {(latest.length > 0 || featured.length > 0) && (
            <div className="mt-7 text-center">
              <Link to="/jobs">
                <Button size="lg" className="rounded-xl min-w-[200px]">
                  View all jobs
                  {jobCount != null && jobCount > 0 ? ` · ${jobCount}` : ''}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* How it works — compact, candidate only */}
        <section className="rounded-2xl border border-[#E8ECF1] bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#0B1220] mb-4 text-center">How applying works</h2>
          <ol className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '1', t: 'Browse', d: 'Search or pick a category and area' },
              { n: '2', t: 'Apply', d: 'Submit in about a minute — no account required' },
              { n: '3', t: 'Hear back', d: 'CareerJob reviews and contacts shortlisted candidates' },
            ].map((s) => (
              <li key={s.n} className="flex sm:flex-col gap-3 sm:text-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0066FF] text-white text-sm font-bold shrink-0 sm:mx-auto">
                  {s.n}
                </span>
                <div>
                  <div className="font-semibold text-sm text-[#0B1220]">{s.t}</div>
                  <div className="text-xs text-[#6B7789] mt-0.5 leading-relaxed">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CV + trust strip */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E8ECF1] bg-white px-4 py-5 flex gap-3 items-start">
            <FileText className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0B1220] text-sm">Need a CV?</p>
              <p className="text-sm text-[#6B7789] mt-0.5 leading-relaxed">
                Build a clear profile so CareerJob can match you faster.
              </p>
              <Link
                to={user ? '/candidate/cv' : '/register'}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF] mt-2"
              >
                Create my CV <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E8ECF1] bg-white px-4 py-5 flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold text-[#0B1220] text-sm">Agency-reviewed applications</p>
              <p className="text-sm text-[#6B7789] mt-0.5 leading-relaxed">
                Every application is reviewed by CareerJob staff in Pokhara — not auto-rejected by a bot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
