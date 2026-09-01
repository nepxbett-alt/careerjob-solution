import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle, FileText, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT, BRAND, POKHARA_AREAS } from '../lib/config';
import { getFeaturedJobs, searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { JobCard } from '../components/ui/JobCard';
import { Seo } from '../components/Seo';
import { supabase } from '../lib/supabase';

type CountItem = { label: string; count: number; href: string };

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [categories, setCategories] = useState<CountItem[]>([]);
  const [areas, setAreas] = useState<CountItem[]>([]);

  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      getFeaturedJobs(12).catch(() => [] as Job[]),
      searchJobs({ location: 'Pokhara', page: 1, limit: 6 }).catch(() => ({ jobs: [] as Job[] })),
      supabase
        .from('jobs')
        .select('id, location, location_detail, job_type, category_id, job_categories(name, slug)')
        .eq('status', 'published')
        .limit(500),
    ])
      .then(([feat, latestRes, allJobs]) => {
        setFeatured((feat || []).filter((j) => j.is_featured));
        setLatest(latestRes.jobs || []);

        const rows = (allJobs.data || []) as any[];
        const catMap = new Map<string, { count: number; slug: string }>();
        const areaMap = new Map<string, number>();

        for (const j of rows) {
          const catName = j.job_categories?.name || j.job_type || 'Other';
          const slug = j.job_categories?.slug || String(j.job_type || 'other').toLowerCase().replace(/\s+/g, '-');
          const prev = catMap.get(catName) || { count: 0, slug };
          catMap.set(catName, { count: prev.count + 1, slug });

          const loc = `${j.location_detail || ''} ${j.location || ''}`.toLowerCase();
          let matched = false;
          for (const area of POKHARA_AREAS) {
            if (area === 'All Pokhara') continue;
            if (loc.includes(area.toLowerCase())) {
              areaMap.set(area, (areaMap.get(area) || 0) + 1);
              matched = true;
              break;
            }
          }
          if (!matched) {
            areaMap.set('Other Pokhara', (areaMap.get('Other Pokhara') || 0) + 1);
          }
        }

        setCategories(
          [...catMap.entries()]
            .map(([label, v]) => ({
              label,
              count: v.count,
              href: `/jobs?category=${encodeURIComponent(v.slug)}`,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 12)
        );
        setAreas(
          [...areaMap.entries()]
            .map(([label, count]) => ({
              label,
              count,
              href: `/jobs?q=${encodeURIComponent(label)}`,
            }))
            .sort((a, b) => b.count - a.count)
        );
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
        title={`${BRAND.name} | Jobs in Pokhara`}
        description="Find jobs in Pokhara. Create your profile, upload your CV, and apply — Career Job Solution reviews every application."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* HERO */}
      <section className="relative border-b border-[#E8ECF1] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-12 pb-14 md:pt-20 md:pb-20">
          <div className="max-w-xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-[#3D4A5C] mb-5">
              <MapPin className="w-3.5 h-3.5 text-[#0066FF]" aria-hidden />
              {BRAND.name} · Pokhara
            </p>
            <h1 className="cj-display text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] mb-3">
              Find your next opportunity
            </h1>
            <p className="text-[0.95rem] md:text-base text-[#6B7789] mb-8 leading-relaxed max-w-md mx-auto">
              Browse jobs in Pokhara, build your profile once, and apply with confidence.
            </p>

            <form onSubmit={handleSearch} className="mb-6" role="search">
              <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#E8ECF1] shadow-[0_8px_28px_rgba(0,102,255,0.07)] text-left">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3] pointer-events-none" aria-hidden />
                  <label htmlFor="home-search" className="sr-only">Search jobs</label>
                  <input
                    id="home-search"
                    type="search"
                    placeholder="Job title or skill…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-3 rounded-xl border-0 bg-transparent text-[0.95rem] focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" className="h-11 px-5 rounded-xl shrink-0">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button fullWidth className="sm:w-auto rounded-xl h-11">
                  <Briefcase className="w-4 h-4" aria-hidden /> Browse jobs
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="outline" fullWidth className="sm:w-auto rounded-xl h-11">
                  <FileText className="w-4 h-4" aria-hidden /> Create your CV
                </Button>
              </Link>
              <Link to="/hire-staff" className="w-full sm:w-auto">
                <Button variant="ghost" fullWidth className="sm:w-auto rounded-xl h-11">
                  <Users className="w-4 h-4" aria-hidden /> Hire staff
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container py-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[#3D4A5C]">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0066FF]" aria-hidden /> Agency-reviewed applications
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden /> WhatsApp {CONTACT.whatsapp}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0066FF]" aria-hidden /> {CONTACT.address}
          </span>
        </div>
      </section>

      {/* Featured — horizontal scroll */}
      {!jobsLoading && featured.length > 0 && (
        <section className="py-10 md:py-12 border-b border-[#E8ECF1]">
          <div className="cj-container">
            <div className="flex items-end justify-between gap-3 mb-4 max-w-3xl">
              <div>
                <p className="cj-eyebrow mb-1">Featured</p>
                <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Top jobs in Pokhara</h2>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] min-h-[44px] inline-flex items-center shrink-0">
                See all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
              {featured.map((job) => (
                <div key={job.id} className="min-w-[280px] max-w-[320px] w-[85vw] sm:w-[300px] snap-start shrink-0">
                  <HomeJobCard job={job} featured />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories with counts */}
      {!jobsLoading && categories.length > 0 && (
        <section className="py-10 border-b border-[#E8ECF1] bg-[#F7F9FC]">
          <div className="cj-container max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight text-[#0B1220] mb-4">Jobs by category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.label}
                  to={c.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8ECF1] px-3.5 py-2 text-sm text-slate-700 hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors"
                >
                  <span className="font-medium">{c.label}</span>
                  <span className="tabular-nums text-xs font-semibold text-slate-400 bg-slate-50 rounded-full px-1.5 py-0.5">
                    {c.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Areas with counts */}
      {!jobsLoading && areas.length > 0 && (
        <section className="py-10 border-b border-[#E8ECF1]">
          <div className="cj-container max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight text-[#0B1220] mb-4">Jobs by area</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {areas.map((a) => (
                <Link
                  key={a.label}
                  to={a.href}
                  className="flex items-center justify-between rounded-xl border border-[#E8ECF1] bg-white px-3.5 py-3 text-sm hover:border-[#0066FF]/40 transition-colors"
                >
                  <span className="font-medium text-slate-800 truncate">{a.label}</span>
                  <span className="tabular-nums text-xs font-bold text-[#0066FF] ml-2">{a.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest jobs */}
      <section className="py-10 md:py-12 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <p className="cj-eyebrow mb-1">Open roles</p>
              <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Latest jobs in Pokhara</h2>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] min-h-[44px] inline-flex items-center">
              View all
            </Link>
          </div>

          {jobsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cj-skeleton h-28 rounded-2xl" />
              ))}
            </div>
          )}

          {!jobsLoading && latest.length === 0 && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 text-center">
              <p className="text-sm text-[#6B7789] mb-4">
                New roles are added regularly. Check back soon or message us on WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/jobs"><Button size="sm" variant="outline">Browse jobs</Button></Link>
                <Link to="/hire-staff"><Button size="sm">Hire staff</Button></Link>
              </div>
            </div>
          )}

          {!jobsLoading && latest.length > 0 && (
            <>
              <div className="space-y-3">
                {latest.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/jobs">
                  <Button size="lg" variant="outline" className="rounded-xl min-w-[180px]">
                    View all jobs <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CV CTA */}
      <section className="py-10 md:py-12 border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl">
          <div className="bg-white border border-[#E8ECF1] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#0066FF]" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-[#0B1220]">
                Your next job starts with a clear profile
              </h2>
              <p className="text-sm text-[#6B7789] mt-1 leading-relaxed">
                Create your profile once, upload your CV, and apply to Pokhara jobs without repeating the same details.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link to="/register">
                <Button className="rounded-xl w-full sm:w-auto">Create profile</Button>
              </Link>
              <Link to="/candidate/cv">
                <Button variant="outline" className="rounded-xl w-full sm:w-auto">Build CV</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 md:py-12 border-b border-[#E8ECF1] bg-white">
        <div className="cj-container max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight text-[#0B1220] text-center mb-8">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E8ECF1] p-5">
              <h3 className="font-semibold text-[#0B1220] mb-3">For job seekers</h3>
              <ol className="space-y-2.5 text-sm text-[#3D4A5C]">
                {['Search jobs in Pokhara', 'Create profile & upload CV', 'Apply in one step', 'We review and support you'].map((t, i) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="text-[#0066FF] font-semibold tabular-nums">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/jobs" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0066FF]">
                Find jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-[#E8ECF1] p-5">
              <h3 className="font-semibold text-[#0B1220] mb-3">For employers</h3>
              <ol className="space-y-2.5 text-sm text-[#3D4A5C]">
                {['Submit a hiring request', 'We publish the role', 'We screen candidates', 'You hire — we support'].map((t, i) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="font-semibold text-[#0B1220] tabular-nums">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/hire-staff" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0B1220]">
                Hire staff <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="py-12 md:py-14 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-md">
          <h2 className="text-xl font-bold tracking-tight mb-2">Need help right now?</h2>
          <p className="text-white/90 text-sm mb-5 leading-relaxed">
            Message {BRAND.name} on WhatsApp — jobs, applications, or hiring.
          </p>
          <WhatsAppButton
            message={`Hello ${BRAND.name}, I need help.`}
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl !h-11"
          />
          <p className="text-xs text-white/70 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
