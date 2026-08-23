import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Shield,
  MapPin,
  Briefcase,
  Users,
  CheckCircle2,
  Utensils,
  Car,
  Building2,
  GraduationCap,
  ShoppingBag,
  Wrench,
  HeartPulse,
  Monitor,
  Sparkles,
  FileText,
  Clock,
  Flame,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT, POKHARA_AREAS } from '../lib/config';
import {
  getFeaturedJobs,
  searchJobs,
  getCategoriesWithCounts,
  getPokharaAreaCounts,
  getClosingSoonJobs,
  getHospitalityJobs,
  getPlatformStats,
  getHiringNowLabels,
} from '../services/jobService';
import type { Job, CategoryCount, AreaCount, PlatformStats, HiringLabelCount } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';
import { formatJobTitle } from '../lib/formatText';
import { formatJobLocation } from '../lib/formatLocation';
import { differenceInCalendarDays, parseISO } from 'date-fns';

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

const POPULAR_SEARCHES = [
  { label: 'Hospitality', q: 'hospitality' },
  { label: 'Hotels & Resorts', q: 'hotel' },
  { label: 'Restaurants', q: 'restaurant' },
  { label: 'Sales', q: 'sales' },
  { label: 'Accounting', q: 'account' },
  { label: 'IT', q: 'computer' },
  { label: 'Retail', q: 'retail' },
  { label: 'Education', q: 'teacher' },
  { label: 'Healthcare', q: 'health' },
  { label: 'Drivers', q: 'driver' },
];

function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  try {
    return differenceInCalendarDays(parseISO(deadline), new Date());
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, lang } = useI18n();

  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [hospitality, setHospitality] = useState<Job[]>([]);
  const [closingSoon, setClosingSoon] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [hiringLabels, setHiringLabels] = useState<HiringLabelCount[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      getFeaturedJobs(6).catch(() => [] as Job[]),
      searchJobs({ page: 1, limit: 10 }).catch(() => ({ jobs: [] as Job[] })),
      getCategoriesWithCounts().catch(() => [] as CategoryCount[]),
      getPokharaAreaCounts().catch(() => [] as AreaCount[]),
      getClosingSoonJobs(4).catch(() => [] as Job[]),
      getHospitalityJobs(6).catch(() => [] as Job[]),
      getPlatformStats().catch(() => null),
      getHiringNowLabels(6).catch(() => [] as HiringLabelCount[]),
    ])
      .then(([feat, latestRes, cats, areaCounts, closing, hosp, st, hiring]) => {
        const featList = (feat || []).filter((j) => j.is_featured);
        setFeatured(featList);
        const featIds = new Set(featList.map((j) => j.id));
        setLatest((latestRes.jobs || []).filter((j) => !featIds.has(j.id)).slice(0, 6));
        setCategories(cats || []);
        setAreas(areaCounts || []);
        setClosingSoon(closing || []);
        setHospitality(hosp || []);
        setStats(st);
        setHiringLabels(hiring || []);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (area && area !== 'All Pokhara') params.set('area', area);
    navigate(`/jobs?${params.toString()}`);
  };

  const isCandidate = profile?.role === 'candidate';
  return (
    <div>
      <Seo
        title="Jobs in Pokhara | Find Jobs & Hire in Pokhara | CareerJob Solution"
        description="Find the latest jobs in Pokhara, Nepal. Hospitality, IT, accounting, sales, healthcare, education and more. Employers can post jobs and find candidates."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* 1. Hero */}
      <section className="relative border-b border-[#E8ECF1] bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0066FF] mb-3">
              <MapPin className="w-4 h-4" aria-hidden />
              Pokhara · Srijana Chowk
            </p>
            <h1 className="cj-display text-3xl sm:text-4xl md:text-[2.75rem] text-[#0B1220] mb-3">
              {lang === 'ne' ? 'पोखरामा जागिर खोज्नुहोस्' : 'Find Jobs in Pokhara'}
            </h1>
            <p className="text-base sm:text-lg text-[#3D4A5C] leading-relaxed mb-7 max-w-xl mx-auto">
              {lang === 'ne'
                ? 'स्थानीय अवसर खोज्नुहोस्, प्रोफाइल बनाउनुहोस् र पोखराका रोजगारदातासँग जोडिनुहोस्।'
                : 'Discover local opportunities, build your professional profile, and connect with employers across Pokhara.'}
            </p>

            <form
              onSubmit={handleSearch}
              className="text-left space-y-2.5 p-3 sm:p-4 rounded-2xl bg-white border border-[#E8ECF1] shadow-[0_8px_30px_rgba(0,102,255,0.08)] max-w-xl mx-auto"
            >
              <div>
                <label htmlFor="home-q" className="cj-label">
                  {lang === 'ne' ? 'के जागिर खोज्दै हुनुहुन्छ?' : 'What job are you looking for?'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" aria-hidden />
                  <input
                    id="home-q"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === 'ne' ? 'पद, सीप…' : 'Job title, skill or company'}
                    className="cj-input pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="home-area" className="cj-label">
                  {lang === 'ne' ? 'पोखराको कुन क्षेत्र?' : 'Where in Pokhara?'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" aria-hidden />
                  <select
                    id="home-area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="cj-input pl-10 appearance-none"
                  >
                    <option value="">{lang === 'ne' ? 'सबै पोखरा' : 'All Pokhara'}</option>
                    {POKHARA_AREAS.filter((a) => a !== 'All Pokhara').map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button type="submit" size="lg" className="rounded-xl flex-1">
                  <Search className="w-4 h-4" aria-hidden />
                  {lang === 'ne' ? 'जागिर खोज्नुहोस्' : 'Search Jobs'}
                </Button>
                <Link to={user ? (isCandidate ? '/candidate/profile' : '/register') : '/register'} className="flex-1">
                  <Button type="button" size="lg" variant="outline" className="rounded-xl w-full">
                    {lang === 'ne' ? 'प्रोफाइल बनाउनुहोस्' : 'Create Your Profile'}
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7789] mb-2">
                {lang === 'ne' ? 'पोखरामा लोकप्रिय' : 'Popular in Pokhara'}
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {POPULAR_SEARCHES.map((p) => (
                  <Link
                    key={p.q}
                    to={`/jobs?q=${encodeURIComponent(p.q)}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F7F9FC] border border-[#E8ECF1] text-[#3D4A5C] hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>

            {stats && stats.jobs > 0 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
                {[
                  { n: stats.jobs, l: lang === 'ne' ? 'खुला पद' : 'Active jobs' },
                  stats.candidates > 0
                    ? { n: stats.candidates, l: lang === 'ne' ? 'उम्मेदवार' : 'Jobseekers' }
                    : null,
                  stats.organizations > 0
                    ? { n: stats.organizations, l: lang === 'ne' ? 'रोजगारदाता' : 'Employers' }
                    : null,
                  stats.applications > 0
                    ? { n: stats.applications, l: lang === 'ne' ? 'आवेदन' : 'Applications' }
                    : null,
                ]
                  .filter(Boolean)
                  .map((s) => (
                    <div
                      key={s!.l}
                      className="rounded-xl border border-[#E8ECF1] bg-white/90 px-2 py-2.5 shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
                    >
                      <div className="text-base font-bold text-[#0B1220] tabular-nums">{s!.n}+</div>
                      <div className="text-[11px] text-[#6B7789]">{s!.l}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Fresh jobs */}
      <section className="py-12 md:py-14 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="cj-eyebrow mb-1">{lang === 'ne' ? 'नयाँ' : 'Fresh today'}</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0B1220]">
                {lang === 'ne' ? 'पोखराका ताजा जागिर' : 'Fresh Jobs in Pokhara'}
              </h2>
              <p className="text-sm text-[#6B7789] mt-1">
                {lang === 'ne' ? 'स्थानीय रोजगारदाताका अवसर' : 'New opportunities from local employers'}
              </p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              {lang === 'ne' ? 'सबै हेर्नुहोस्' : 'View All Pokhara Jobs'} →
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  {featured.slice(0, 1).map((job) => (
                    <HomeJobCard key={job.id} job={job} featured />
                  ))}
                  <div className="grid gap-3 content-start">
                    {featured.slice(1, 5).map((job) => (
                      <HomeJobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              )}
              {latest.length > 0 && (
                <div className={`grid gap-3 sm:grid-cols-2 ${featured.length ? 'mt-6' : ''}`}>
                  {latest.slice(0, 6).map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
              {!featured.length && !latest.length && (
                <p className="text-center text-[#6B7789] py-10">{t('empty_jobs')}</p>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Link to="/jobs">
              <Button variant="outline" size="lg" className="rounded-xl">
                {lang === 'ne' ? 'सबै पोखरा जागिर' : 'View All Pokhara Jobs'}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Areas */}
      {areas.length > 0 && (
        <section className="py-12 border-b border-[#E8ECF1] bg-white">
          <div className="cj-container">
            <h2 className="text-xl font-bold tracking-tight text-[#0B1220] mb-2">
              {lang === 'ne' ? 'क्षेत्र अनुसार जागिर' : 'Explore Jobs by Area'}
            </h2>
            <p className="text-sm text-[#6B7789] mb-5">
              {lang === 'ne' ? 'पोखराका वास्तविक स्थान' : 'Real locations from open vacancies'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {areas.map((a) => (
                <Link
                  key={a.name}
                  to={`/jobs?area=${encodeURIComponent(a.name)}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] hover:bg-white hover:border-[#0066FF]/30 px-3.5 py-3 transition-all"
                >
                  <span className="text-sm font-semibold text-[#0B1220] flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#0066FF] shrink-0" aria-hidden />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <span className="text-xs font-medium text-[#6B7789] tabular-nums shrink-0">{a.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Industry */}
      {categories.length > 0 && (
        <section className="py-12 border-b border-[#E8ECF1] bg-[#F7F9FC]">
          <div className="cj-container">
            <h2 className="text-xl font-bold tracking-tight text-[#0B1220] mb-2">
              {lang === 'ne' ? 'उद्योग अनुसार' : 'Explore Pokhara Jobs by Industry'}
            </h2>
            <p className="text-sm text-[#6B7789] mb-5">
              {lang === 'ne' ? 'वास्तविक गणना' : 'Live counts from open roles'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.slice(0, 12).map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] || Briefcase;
                return (
                  <Link
                    key={c.id}
                    to={`/jobs?category=${c.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-[#E8ECF1] bg-white hover:border-[#0066FF]/30 hover:shadow-sm p-3.5 transition-all"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#0066FF] shrink-0">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0B1220] truncate group-hover:text-[#0066FF]">
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
          </div>
        </section>
      )}

      {/* 7. Hospitality feature */}
      {hospitality.length > 0 && (
        <section className="py-12 border-b border-[#E8ECF1] bg-white">
          <div className="cj-container">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="cj-eyebrow mb-1">🏨 Hospitality</p>
                <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">
                  {lang === 'ne' ? 'पोखरामा होटल तथा रेस्टुरेन्ट जागिर' : 'Hospitality Jobs in Pokhara'}
                </h2>
                <p className="text-sm text-[#6B7789] mt-1">
                  {lang === 'ne'
                    ? 'होटल, रिसोर्ट, रेस्टुरेन्ट र पर्यटन'
                    : 'Hotels, resorts, restaurants and tourism businesses hiring now'}
                </p>
              </div>
              <Link
                to={`/jobs?category=${categories.find((c) => c.slug === 'hotel-restaurant')?.id || ''}`}
                className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {hospitality.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Hiring now labels */}
      {hiringLabels.length > 0 && (
        <section className="py-12 border-b border-[#E8ECF1] bg-[#F7F9FC]">
          <div className="cj-container">
            <h2 className="text-xl font-bold tracking-tight text-[#0B1220] mb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" aria-hidden />
              {lang === 'ne' ? 'अहिले भर्ती हुँदै' : 'Hiring Now in Pokhara'}
            </h2>
            <p className="text-sm text-[#6B7789] mb-5">
              {lang === 'ne' ? 'खुला पद भएका रोजगारदाता' : 'Employers with open positions (public labels only)'}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hiringLabels.map((h) => (
                <Link
                  key={h.label}
                  to={`/jobs?q=${encodeURIComponent(h.label)}`}
                  className="rounded-2xl border border-[#E8ECF1] bg-white p-4 hover:border-[#0066FF]/30 transition-all"
                >
                  <div className="font-semibold text-[#0B1220] truncate">{h.label}</div>
                  <div className="text-sm text-[#6B7789] mt-1">
                    {h.count} open {h.count === 1 ? 'position' : 'positions'}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF] mt-2">
                    View jobs <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Closing soon */}
      {closingSoon.length > 0 && (
        <section className="py-12 border-b border-[#E8ECF1] bg-white">
          <div className="cj-container">
            <h2 className="text-xl font-bold tracking-tight text-[#0B1220] mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" aria-hidden />
              {lang === 'ne' ? 'चाँडै बन्द हुने' : 'Jobs Closing Soon'}
            </h2>
            <p className="text-sm text-[#6B7789] mb-5">
              {lang === 'ne' ? 'आवेदन म्याद नजिक' : 'Application deadlines approaching'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {closingSoon.map((job) => {
                const days = daysUntil(job.application_deadline);
                const title = formatJobTitle(job.title) || job.title;
                const loc = formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' });
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 hover:border-amber-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0B1220] truncate">{title}</div>
                      <div className="text-sm text-[#6B7789] truncate">{loc || 'Pokhara'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-800">
                        {days != null && days <= 0
                          ? 'Closes today'
                          : days != null
                            ? `Closes in ${days} day${days === 1 ? '' : 's'}`
                            : 'Apply soon'}
                      </div>
                      <span className="text-sm font-semibold text-[#0066FF]">Apply now →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 10 + 11 CV / profile */}
      <section className="py-12 border-b border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E8ECF1] bg-white p-5 sm:p-6">
              <FileText className="w-8 h-8 text-[#0066FF] mb-3" aria-hidden />
              <h2 className="text-lg font-bold text-[#0B1220] mb-1">
                {lang === 'ne' ? 'व्यावसायिक CV बनाउनुहोस्' : 'Build Your Professional CV'}
              </h2>
              <p className="text-sm text-[#6B7789] mb-4 leading-relaxed">
                {lang === 'ne'
                  ? 'पोखराका रोजगारदातालाई तपाईंको सीप देखाउनुहोस्।'
                  : 'Create a professional CV and make your skills visible to Pokhara employers.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to={user ? '/candidate/cv' : '/register'}>
                  <Button size="sm">{lang === 'ne' ? 'CV बनाउनुहोस्' : 'Create My CV'}</Button>
                </Link>
                <Link to={user ? '/candidate/profile' : '/register'}>
                  <Button size="sm" variant="outline">
                    {lang === 'ne' ? 'प्रोफाइल' : 'Create Profile'}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8ECF1] bg-white p-5 sm:p-6">
              <Users className="w-8 h-8 text-[#0B1220] mb-3" aria-hidden />
              <h2 className="text-lg font-bold text-[#0B1220] mb-1">
                {lang === 'ne' ? 'रोजगारदाताले तपाईंलाई भेटून्' : 'Let Pokhara Employers Find You'}
              </h2>
              <p className="text-sm text-[#6B7789] mb-3 leading-relaxed">
                {lang === 'ne'
                  ? 'प्रोफाइल, अनुभव, शिक्षा र सीप थप्नुहोस्।'
                  : 'Showcase skills, experience, education, languages and preferred position.'}
              </p>
              <ul className="text-xs text-[#6B7789] space-y-1 mb-4">
                {['Professional profile', 'CV', 'Experience', 'Education', 'Skills', 'Languages'].map((b) => (
                  <li key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF]" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <Link to={user ? '/candidate/profile' : '/register'}>
                <Button size="sm" variant="outline">
                  {lang === 'ne' ? 'जॉबसीकर प्रोफाइल' : 'Create Jobseeker Profile'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Application tracking */}
      <section className="py-10 border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-xl text-center">
          {user && isCandidate ? (
            <>
              <h2 className="text-lg font-bold text-[#0B1220] mb-2">
                {lang === 'ne' ? 'आफ्नो आवेदन ट्र्याक गर्नुहोस्' : 'Track Your Applications'}
              </h2>
              <p className="text-sm text-[#6B7789] mb-3">
                Applied → Reviewing → Shortlisted → Interview → Selected
              </p>
              <Link to="/candidate/applications">
                <Button size="sm">View My Applications</Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[#0B1220] mb-2">
                {lang === 'ne' ? 'पहिले नै आवेदन दिनुभयो?' : 'Already applied for a job?'}
              </h2>
              <p className="text-sm text-[#6B7789] mb-3">
                {lang === 'ne'
                  ? 'आवेदन स्थिति हेर्न लग इन गर्नुहोस्।'
                  : 'Log in to track your applications with CareerJob.'}
              </p>
              <Link to="/login">
                <Button size="sm" variant="outline">
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 15. Why CareerJob */}

      <section className="py-12 border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight text-[#0B1220] text-center mb-6">
            {lang === 'ne' ? 'किन CareerJob?' : 'Why Find Your Next Job on CareerJob?'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                icon: MapPin,
                t: lang === 'ne' ? 'स्थानीय अवसर' : 'Local Opportunities',
                d: lang === 'ne' ? 'पोखराका रोजगारदाताका जागिर' : 'Jobs from employers in Pokhara',
              },
              {
                icon: FileText,
                t: lang === 'ne' ? 'व्यावसायिक प्रोफाइल' : 'Professional Profile',
                d: lang === 'ne' ? 'अनुभव र सीप देखाउनुहोस्' : 'Showcase your experience and skills',
              },
              {
                icon: CheckCircle2,
                t: lang === 'ne' ? 'सजिलो आवेदन' : 'Easy Applications',
                d: lang === 'ne' ? 'बिना खाता पनि आवेदन' : 'Apply without unnecessary steps',
              },
              {
                icon: Building2,
                t: lang === 'ne' ? 'स्थानीय रोजगारदाता' : 'Local Employers',
                d: lang === 'ne' ? 'एजेन्सीले सहयोग गर्ने भर्ती' : 'Agency-supported hiring in Pokhara',
              },
            ].map((x) => (
              <div key={x.t} className="flex gap-3 rounded-2xl border border-[#E8ECF1] p-4">
                <x.icon className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" aria-hidden />
                <div>
                  <div className="font-semibold text-[#0B1220] text-sm">{x.t}</div>
                  <div className="text-sm text-[#6B7789] mt-0.5">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 18. Final CTA */}
      <section className="py-12 md:py-14 bg-[#0B1220] text-white">
        <div className="cj-container text-center max-w-lg">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            {lang === 'ne' ? 'तपाईंको अर्को अवसर पोखरामा छ।' : 'Your next opportunity is in Pokhara.'}
          </h2>
          <p className="text-white/75 text-sm mb-6 leading-relaxed">
            {lang === 'ne'
              ? 'स्थानीय जागिर खोज्नुहोस्, प्रोफाइल बनाउनुहोस् र रोजगारदातासँग जोडिनुहोस्।'
              : 'Find local jobs, build your profile and connect with employers.'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Link to="/jobs">
              <Button size="lg" className="rounded-xl !bg-white !text-[#0B1220] hover:!bg-slate-100">
                {lang === 'ne' ? 'जागिर खोज्नुहोस्' : 'Find Jobs'}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="rounded-xl !border-white/30 !text-white hover:!bg-white/10">
                {lang === 'ne' ? 'प्रोफाइल' : 'Create Your Profile'}
              </Button>
            </Link>
          </div>
          <WhatsAppButton
            message="Hello CareerJob, I need help with jobs in Pokhara."
            label={lang === 'ne' ? 'WhatsApp' : 'Chat on WhatsApp'}
            className="!bg-[#25D366] !text-white hover:!bg-[#20bd5a] !rounded-xl"
          />
          <p className="text-xs text-white/45 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
