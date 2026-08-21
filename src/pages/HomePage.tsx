import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Shield,
  MessageCircle,
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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import {
  getFeaturedJobs,
  searchJobs,
  getCategoriesWithCounts,
  getPublishedJobCount,
} from '../services/jobService';
import type { Job, CategoryCount } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { useI18n } from '../lib/i18n';

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

const AREA_LINKS = [
  'Lakeside',
  'New Road',
  'Srijana Chowk',
  'Mahendrapool',
  'Chipledhunga',
  'Birauta',
  'Zero KM',
  'Hemja',
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const { t, lang } = useI18n();

  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      getFeaturedJobs(8).catch(() => [] as Job[]),
      searchJobs({ page: 1, limit: 12 }).catch(() => ({ jobs: [] as Job[] })),
      getCategoriesWithCounts().catch(() => [] as CategoryCount[]),
      getPublishedJobCount().catch(() => 0),
    ])
      .then(([feat, latestRes, cats, count]) => {
        const featList = (feat || []).filter((j) => j.is_featured);
        setFeatured(featList);
        const featIds = new Set(featList.map((j) => j.id));
        setLatest((latestRes.jobs || []).filter((j) => !featIds.has(j.id)).slice(0, 8));
        setCategories(cats || []);
        setJobCount(count || 0);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <Seo
        title="CareerJob Solution | Jobs in Pokhara"
        description="Browse verified jobs in Pokhara. Apply without an account — CareerJob reviews every application."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* Hero */}
      <section className="relative border-b border-[#E8ECF1] bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-12 pb-12 md:pt-18 md:pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0066FF] mb-4">
              <MapPin className="w-4 h-4" aria-hidden />
              Pokhara · Srijana Chowk
            </p>
            <h1 className="cj-display text-3xl sm:text-4xl md:text-[2.75rem] text-[#0B1220] mb-4">
              {t('hero_title')}
            </h1>
            <p className="text-base sm:text-lg text-[#3D4A5C] leading-relaxed mb-8 max-w-xl mx-auto">
              {t('hero_sub')}
            </p>

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 rounded-2xl bg-white border border-[#E8ECF1] shadow-[0_8px_30px_rgba(0,102,255,0.08)] max-w-xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3]" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full h-12 sm:h-11 pl-11 pr-3 rounded-xl bg-transparent border-0 text-[#0B1220] placeholder:text-[#98A2B3] focus:outline-none focus:ring-0"
                  aria-label={t('search_placeholder')}
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl h-12 sm:h-11 shrink-0">
                {t('search_btn')}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
              <Link to="/jobs">
                <Button size="lg" className="rounded-xl">
                  <Briefcase className="w-4 h-4" aria-hidden />
                  {t('browse_jobs')}
                  {jobCount != null && jobCount > 0 ? ` (${jobCount})` : ''}
                </Button>
              </Link>
              <Link to="/for-businesses">
                <Button size="lg" variant="outline" className="rounded-xl">
                  {t('hire_talent')}
                </Button>
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                {
                  icon: Briefcase,
                  value: jobCount != null ? String(jobCount) : '—',
                  label: lang === 'ne' ? 'खुला पद' : 'Open roles',
                },
                {
                  icon: Shield,
                  value: lang === 'ne' ? 'एजेन्सी' : 'Agency',
                  label: lang === 'ne' ? 'समीक्षा' : 'Reviewed',
                },
                {
                  icon: CheckCircle2,
                  value: lang === 'ne' ? 'बिना' : 'No',
                  label: lang === 'ne' ? 'खाता' : 'Account needed',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-[#E8ECF1] bg-white/80 px-2 py-3 shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
                >
                  <s.icon className="w-4 h-4 text-[#0066FF] mx-auto mb-1" aria-hidden />
                  <div className="text-sm font-bold text-[#0B1220] tabular-nums">{s.value}</div>
                  <div className="text-[11px] text-[#6B7789] leading-tight mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories with counts */}
      {categories.length > 0 && (
        <section className="py-12 md:py-14 border-b border-[#E8ECF1] bg-white">
          <div className="cj-container">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="cj-eyebrow mb-1">{t('categories')}</p>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0B1220]">
                  {lang === 'ne' ? 'श्रेणी अनुसार खोज्नुहोस्' : 'Browse by category'}
                </h2>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
                {t('view_all')}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.slice(0, 8).map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] || Briefcase;
                return (
                  <Link
                    key={c.id}
                    to={`/jobs?category=${c.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] hover:bg-white hover:border-[#0066FF]/30 hover:shadow-sm p-3.5 sm:p-4 transition-all"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E8ECF1] text-[#0066FF] group-hover:border-[#0066FF]/30 shrink-0">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0B1220] truncate group-hover:text-[#0066FF] transition-colors">
                        {c.name}
                      </span>
                      <span className="block text-xs text-[#6B7789] tabular-nums mt-0.5">
                        {c.count} {lang === 'ne' ? 'पद' : c.count === 1 ? 'job' : 'jobs'}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Popular areas */}
      <section className="py-8 border-b border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7789] mb-3">
            {lang === 'ne' ? 'पोखराका क्षेत्र' : 'Popular areas in Pokhara'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/jobs"
              className="px-3.5 py-2 rounded-full text-sm font-medium bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors"
            >
              {lang === 'ne' ? 'सबै पोखरा' : 'All Pokhara'}
            </Link>
            {AREA_LINKS.map((a) => (
              <Link
                key={a}
                to={`/jobs?area=${encodeURIComponent(a)}`}
                className="px-3.5 py-2 rounded-full text-sm font-medium bg-white border border-[#E8ECF1] text-[#3D4A5C] hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors"
              >
                {a}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-12 md:py-16 bg-[#F7F9FC]">
        <div className="cj-container">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="cj-eyebrow mb-1">{t('open_roles')}</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0B1220]">
                {featured.length > 0 ? t('featured_title') : t('latest_title')}
              </h2>
              <p className="text-sm text-[#6B7789] mt-1">{t('latest_sub')}</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0">
              {t('view_all')}
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
                <div className="mt-8">
                  {featured.length > 0 && (
                    <h3 className="text-sm font-semibold text-[#6B7789] uppercase tracking-wide mb-3">
                      {t('latest_title')}
                    </h3>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {latest.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              )}

              {!featured.length && !latest.length && (
                <p className="text-center text-[#6B7789] py-12">{t('empty_jobs')}</p>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Link to="/jobs">
              <Button variant="outline" size="lg" className="rounded-xl">
                {t('view_all_jobs')}
                {jobCount != null && jobCount > 0 ? ` · ${jobCount}` : ''}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-16 border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight text-[#0B1220] text-center mb-8">{t('how_title')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E8ECF1] p-5 bg-[#F7F9FC]">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#0066FF]" aria-hidden />
                <h3 className="font-semibold text-[#0B1220]">{t('how_seeker')}</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-[#3D4A5C]">
                {(lang === 'ne'
                  ? ['पद खोज्नुहोस्', 'बिना लगइन आवेदन दिनुहोस्', 'हामी समीक्षा गर्छौं', 'छानिएमा सम्पर्क']
                  : ['Browse open roles', 'Apply without an account', 'We review every application', 'We contact you if shortlisted']
                ).map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="font-semibold text-[#0066FF] tabular-nums">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link to="/jobs" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0066FF]">
                {t('browse_jobs')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-[#E8ECF1] p-5 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-[#0B1220]" aria-hidden />
                <h3 className="font-semibold text-[#0B1220]">{t('how_employer')}</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-[#3D4A5C]">
                {(lang === 'ne'
                  ? ['भर्ती अनुरोध पठाउनुहोस्', 'हामी पद प्रकाशित गर्छौं', 'उम्मेदवार छान्छौं', 'अन्तर्वार्ता — हामी सहयोग गर्छौं']
                  : ['Submit a hiring request', 'We publish the role', 'We screen candidates', 'You interview — we support']
                ).map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="font-semibold text-[#0B1220] tabular-nums">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link
                to="/for-businesses"
                className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0B1220]"
              >
                {t('hire_talent')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Employers */}
      <section className="py-12 md:py-14 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container max-w-xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#0B1220] mb-2">{t('business_title')}</h2>
          <p className="text-sm text-[#6B7789] mb-5 leading-relaxed">{t('business_sub')}</p>
          <Link to="/for-businesses">
            <Button size="lg" className="rounded-xl">
              {t('submit_req')}
            </Button>
          </Link>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="py-12 md:py-14 bg-[#0B1220] text-white">
        <div className="cj-container text-center max-w-md">
          <h2 className="text-xl font-bold tracking-tight mb-2">{t('whatsapp_help')}</h2>
          <p className="text-white/75 text-sm mb-5 leading-relaxed">{t('whatsapp_sub')}</p>
          <WhatsAppButton
            message="Hello CareerJob, I need help."
            label={t('chat_wa')}
            className="!bg-[#25D366] !text-white hover:!bg-[#20bd5a] !rounded-xl !h-11"
          />
          <p className="text-xs text-white/50 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
