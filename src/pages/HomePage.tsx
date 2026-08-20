import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BRAND, CONTACT } from '../lib/config';
import { getFeaturedJobs } from '../services/jobService';
import type { Job } from '../services/jobService';
import { HomeJobCard } from '../components/ui/HomeJobCard';
import { Seo } from '../components/Seo';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const location = 'Pokhara';
  const navigate = useNavigate();
  const [latest, setLatest] = useState<Job[]>([]);

  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    setJobsLoading(true);
    getFeaturedJobs(6)
      .then(setLatest)
      .catch(() => setLatest([]))
      .finally(() => setJobsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    params.set('location', 'Pokhara');
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <Seo
        title="CareerJob Solution | Jobs in Pokhara & Nepal"
        description="Find jobs in Pokhara and across Nepal. Apply simply — CareerJob reviews every application."
        canonical="https://careerjobsolution.com.np/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8ECF1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#EEF4FF_0%,_transparent_60%)] pointer-events-none" />
        <div className="cj-container relative pt-14 pb-16 md:pt-24 md:pb-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-[#E8ECF1] px-3.5 py-1.5 text-xs font-medium text-[#3D4A5C] mb-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" aria-hidden />
              Recruitment agency · Pokhara, Nepal
            </div>
            <h1 className="cj-display text-[1.9rem] sm:text-4xl md:text-[2.85rem] mb-4">
              Find your next job in Pokhara
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
              Trusted openings in Pokhara — CareerJob reviews every application and stays with you until placement.
            </p>

            <form onSubmit={handleSearch} className="mb-7" role="search">
              <div className="flex flex-col sm:flex-row gap-2 p-2 sm:p-2.5 bg-white rounded-[1.25rem] border border-[#E8ECF1] shadow-[0_8px_30px_rgba(0,102,255,0.08),0_2px_8px_rgba(11,18,32,0.04)] text-left">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden />
                  <label htmlFor="home-search" className="sr-only">Search jobs</label>
                  <input
                    id="home-search"
                    type="search"
                    placeholder="Job title or skill"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-3 rounded-xl border-0 bg-transparent text-base focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-7 rounded-xl shrink-0">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto rounded-xl min-h-[48px]">
                  <Briefcase className="w-4.5 h-4.5" aria-hidden /> Browse jobs
                </Button>
              </Link>
              <Link to="/for-businesses" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="sm:w-auto rounded-xl min-h-[48px]">
                  <Users className="w-4.5 h-4.5" aria-hidden /> Hire staff
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-slate-100 bg-white">
        <div className="cj-container py-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-[#0066FF]" aria-hidden /> Agency-reviewed applications</span>
          <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden /> WhatsApp {CONTACT.whatsapp}</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0066FF]" aria-hidden /> No pay-to-apply for candidates</span>
        </div>
      </section>


      {/* Latest jobs — always visible */}
      <section className="py-12 md:py-16 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl md:max-w-4xl">
          <div className="flex items-end justify-between gap-3 mb-6">
            <div>
              <p className="cj-eyebrow mb-1.5">Top picks</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0B1220]">Featured jobs</h2>
              <p className="text-sm text-[#6B7789] mt-1">Selected by CareerJob · Apply in minutes</p>
            </div>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-[#0066FF] shrink-0 min-h-[44px] inline-flex items-center"
            >
              See all jobs
            </Link>
          </div>

          {jobsLoading && (
            <div className="space-y-3">
              <div className="cj-skeleton h-28 rounded-2xl" />
              <div className="cj-skeleton h-28 rounded-2xl" />
              <div className="cj-skeleton h-28 rounded-2xl" />
            </div>
          )}

          {!jobsLoading && latest.length === 0 && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 text-center">
              <p className="text-sm text-[#6B7789] mb-4">New roles are added regularly. Check back soon or browse all jobs.</p>
              <Link to="/jobs"><Button size="sm">Browse jobs</Button></Link>
            </div>
          )}

          {!jobsLoading && latest.length > 0 && (
            <div className="space-y-2.5 sm:space-y-3">
              {latest.map((job, i) => (
                <HomeJobCard key={job.id} job={job} featured={i === 0} />
              ))}
            </div>
          )}

          {!jobsLoading && latest.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="rounded-xl min-w-[200px]">
                  View all jobs
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works briefly */}
      <section className="py-14 md:py-16 bg-slate-50">
        <div className="cj-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-600 max-w-md mx-auto text-[0.95rem]">Clear steps. CareerJob stays involved — not a faceless job board.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#E8F1FF] text-[#0066FF] flex items-center justify-center text-sm font-bold">JS</span>
                Job seekers
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                {['Search jobs in Pokhara & Nepal', 'Apply with a simple profile + CV', 'We review — then contact you', 'Interview & placement support'].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#0066FF] font-semibold w-5 shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/jobs" className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-[#0066FF]">
                Find jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">B</span>
                Businesses
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                {['Submit a hiring request', 'We accept and publish the role', 'We screen and shortlist', 'You interview — we support joining'].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="font-semibold text-slate-800 w-5 shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/for-businesses" className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-slate-800">
                Request staff <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-16 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Need help right now?</h2>
          <p className="text-white/90 mb-6 leading-relaxed text-[0.95rem]">
            Message CareerJob on WhatsApp — jobs, applications, or hiring questions.
          </p>
          <WhatsAppButton
            message="Hello CareerJob, I need help."
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl !h-12"
          />
          <p className="text-xs text-white/70 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
