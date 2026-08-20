import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle, FileText, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { getFeaturedJobs, searchJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { JobCard } from '../components/ui/JobCard';
import { Seo } from '../components/Seo';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      getFeaturedJobs(6).catch(() => [] as Job[]),
      searchJobs({ location: 'Pokhara', page: 1, limit: 6 }).catch(() => ({ jobs: [] as Job[] })),
    ])
      .then(([feat, latestRes]) => {
        setFeatured(feat.filter((j) => j.is_featured));
        setLatest(latestRes.jobs || []);
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
        description="Find jobs in Pokhara. Create your profile, upload your CV, and apply — CareerJob reviews every application."
        canonical="https://careerjobsolution.com.np/"
      />

      {/* HERO */}
      <section className="relative border-b border-[#E8ECF1] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-12 pb-14 md:pt-20 md:pb-24">
          <div className="max-w-xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-[#3D4A5C] mb-5">
              <MapPin className="w-3.5 h-3.5 text-[#0066FF]" aria-hidden />
              Pokhara · Srijana Chowk
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
              <Link to="/for-businesses" className="w-full sm:w-auto">
                <Button variant="ghost" fullWidth className="sm:w-auto rounded-xl h-11">
                  <Users className="w-4 h-4" aria-hidden /> Hire talent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
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

      {/* Featured jobs — only if admin marked any */}
      {!jobsLoading && featured.length > 0 && (
        <section className="py-12 md:py-14 border-b border-[#E8ECF1]">
          <div className="cj-container max-w-3xl">
            <div className="flex items-end justify-between gap-3 mb-5">
              <div>
                <p className="cj-eyebrow mb-1">Featured</p>
                <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Top jobs in Pokhara</h2>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-[#0066FF] min-h-[44px] inline-flex items-center">
                See all
              </Link>
            </div>
            <div className="space-y-2.5">
              {featured.map((job, i) => (
                <HomeJobCard key={job.id} job={job} featured={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest jobs — always */}
      <section className="py-12 md:py-14 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <p className="cj-eyebrow mb-1">Open roles</p>
              <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Latest jobs in Pokhara</h2>
              <p className="text-sm text-[#6B7789] mt-1">Real openings · Apply in minutes</p>
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
                <Link to="/contact"><Button size="sm">Contact</Button></Link>
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
      <section className="py-12 md:py-14 border-b border-[#E8ECF1]">
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
              <Link to="/candidate/profile">
                <Button variant="outline" className="rounded-xl w-full sm:w-auto">Upload CV</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — simple */}
      <section className="py-12 md:py-14 border-b border-[#E8ECF1] bg-white">
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
                {['Submit a hiring request', 'We publish the role', 'We screen candidates', 'You interview — we support hire'].map((t, i) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="font-semibold text-[#0B1220] tabular-nums">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/for-businesses" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0B1220]">
                Hire talent <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-12 md:py-14 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-md">
          <h2 className="text-xl font-bold tracking-tight mb-2">Need help right now?</h2>
          <p className="text-white/90 text-sm mb-5 leading-relaxed">
            Message CareerJob on WhatsApp — jobs, applications, or hiring.
          </p>
          <WhatsAppButton
            message="Hello CareerJob, I need help."
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl !h-11"
          />
          <p className="text-xs text-white/70 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
