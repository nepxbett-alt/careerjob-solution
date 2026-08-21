import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, MessageCircle, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { getFeaturedJobs, searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { JobCard } from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { useI18n } from '../lib/i18n';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const { t, lang } = useI18n();

  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      getFeaturedJobs(6).catch(() => [] as Job[]),
      // Full Pokhara-area inventory — do not require literal "Pokhara" in location
      searchJobs({ page: 1, limit: 8 }).catch(() => ({ jobs: [] as Job[] })),
    ])
      .then(([feat, latestRes]) => {
        const featList = (feat || []).filter((j) => j.is_featured);
        setFeatured(featList);
        const featIds = new Set(featList.map((j) => j.id));
        setLatest((latestRes.jobs || []).filter((j) => !featIds.has(j.id)).slice(0, 6));
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
        description="Find jobs in Pokhara. Apply without an account — CareerJob reviews every application."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* Hero — restrained, recruitment-focused */}
      <section className="relative border-b border-[#E8ECF1] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-1.5 text-sm text-[#6B7789] mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#0066FF]" aria-hidden />
              Pokhara · Srijana Chowk
            </p>
            <h1 className="cj-display text-[1.75rem] sm:text-4xl md:text-[2.5rem] mb-3">
              {t('hero_title')}
            </h1>
            <p className="text-[#3D4A5C] text-[0.95rem] sm:text-base mb-8 leading-relaxed max-w-lg mx-auto">
              {t('hero_sub')}
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
              <div className="flex gap-2 p-1.5 rounded-2xl border border-[#E8ECF1] bg-white shadow-[0_8px_30px_rgba(0,102,255,0.08)]">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" aria-hidden />
                  <label htmlFor="home-search" className="sr-only">
                    {t('search_placeholder')}
                  </label>
                  <input
                    id="home-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full h-11 pl-10 pr-3 rounded-xl text-[0.95rem] text-[#0B1220] placeholder:text-[#98A2B3] focus:outline-none bg-transparent"
                  />
                </div>
                <Button type="submit" className="h-11 px-5 rounded-xl shrink-0">
                  {t('search_btn')}
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2.5">
              <Link to="/jobs">
                <Button size="lg" className="rounded-xl min-w-[140px]">
                  {t('browse_jobs')}
                </Button>
              </Link>
              <Link to="/for-businesses">
                <Button size="lg" variant="outline" className="rounded-xl min-w-[140px]">
                  {t('hire_talent')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#6B7789]">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#0066FF]" aria-hidden />
              {t('trust_agency')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden />
              WhatsApp {CONTACT.whatsapp}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0066FF]" aria-hidden />
              {CONTACT.address}
            </span>
          </div>
        </div>
      </section>

      {/* Open roles — featured first, then latest (no empty category grid) */}
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
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — compact, honest */}
      <section className="py-12 md:py-16 border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight text-[#0B1220] text-center mb-8">{t('how_title')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E8ECF1] p-5">
              <h3 className="font-semibold text-[#0B1220] mb-3">{t('how_seeker')}</h3>
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
            <div className="rounded-2xl border border-[#E8ECF1] p-5">
              <h3 className="font-semibold text-[#0B1220] mb-3">{t('how_employer')}</h3>
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

      {/* Employers CTA */}
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

      {/* Contact — single clear WhatsApp CTA (not repeated on every card) */}
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
