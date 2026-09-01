import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle, MapPin } from 'lucide-react';
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
        title="CareerJob Solution | Jobs & Staffing in Pokhara"
        description="Find a job or hire staff in Pokhara. Our recruitment team matches people with workplaces."
        canonical="https://careerjobsolution.com.np/"
      />

      <section className="relative border-b border-[#E8ECF1] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_#EEF4FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-12 pb-12 md:pt-16 md:pb-16">
          <div className="max-w-xl mx-auto text-center mb-8">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-[#3D4A5C] mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#0066FF]" aria-hidden />
              Pokhara · Human-led recruitment
            </p>
            <h1 className="cj-display text-[1.85rem] sm:text-[2.35rem] mb-3">
              Find work. Hire staff.
            </h1>
            <p className="text-[0.95rem] text-[#6B7789] leading-relaxed max-w-md mx-auto">
              CareerJob connects job seekers and workplaces in Pokhara. Our team handles the matching.
            </p>
          </div>

          {/* Two primary paths */}
          <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-3 mb-8">
            <Link
              to="/find-a-job"
              className="group block bg-white border-2 border-[#0066FF]/25 hover:border-[#0066FF] rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5 text-[#0066FF]" aria-hidden />
              </div>
              <h2 className="font-bold text-lg text-slate-900 group-hover:text-[#0066FF]">Find a job</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Submit your details. Our recruitment team will contact you about suitable roles.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF] mt-3">
                Submit details <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/hire-staff"
              className="group block bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-slate-700" aria-hidden />
              </div>
              <h2 className="font-bold text-lg text-slate-900">Hire staff</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Tell us who you need. We screen candidates and coordinate with your workplace.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800 mt-3">
                Request staff <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto" role="search">
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#E8ECF1] shadow-sm">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#98A2B3]" aria-hidden />
                <label htmlFor="home-search" className="sr-only">Search jobs</label>
                <input
                  id="home-search"
                  type="search"
                  placeholder="Or search open jobs…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-2 border-0 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <Button type="submit" size="sm" className="h-10 rounded-xl">Search</Button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-b border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container py-3.5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[#3D4A5C]">
          <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-[#0066FF]" aria-hidden /> Team-reviewed matching</span>
          <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden /> WhatsApp {CONTACT.whatsapp}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-[#0066FF]" aria-hidden /> {CONTACT.address}</span>
        </div>
      </section>

      {!jobsLoading && featured.length > 0 && (
        <section className="py-10 border-b border-[#E8ECF1]">
          <div className="cj-container max-w-3xl">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-slate-900">Featured jobs</h2>
              <Link to="/jobs" className="text-sm font-semibold text-[#0066FF]">See all</Link>
            </div>
            <div className="space-y-2.5">
              {featured.map((job, i) => (
                <HomeJobCard key={job.id} job={job} featured={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 bg-[#F7F9FC] border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Open jobs in Pokhara</h2>
              <p className="text-sm text-slate-500">Or submit your details — we will contact you</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-[#0066FF]">View all</Link>
          </div>
          {jobsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cj-skeleton h-24 rounded-2xl" />
              ))}
            </div>
          )}
          {!jobsLoading && latest.length === 0 && (
            <div className="bg-white border rounded-2xl p-6 text-center text-sm text-slate-500">
              No published jobs yet. <Link to="/find-a-job" className="text-[#0066FF] font-medium">Submit your details</Link> and we will contact you.
            </div>
          )}
          {!jobsLoading && latest.length > 0 && (
            <div className="space-y-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10 border-b border-[#E8ECF1]">
        <div className="cj-container max-w-3xl">
          <h2 className="text-lg font-bold text-center text-slate-900 mb-6">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold mb-2">Job seekers</h3>
              <ol className="space-y-1.5 text-slate-600">
                <li>1. Submit your details</li>
                <li>2. We contact you</li>
                <li>3. We match a workplace</li>
                <li>4. Trial or placement</li>
              </ol>
              <Link to="/find-a-job" className="inline-flex items-center gap-1 mt-3 font-semibold text-[#0066FF]">
                Find a job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold mb-2">Employers</h3>
              <ol className="space-y-1.5 text-slate-600">
                <li>1. Request staff</li>
                <li>2. We confirm requirements</li>
                <li>3. We send screened candidates</li>
                <li>4. You hire — we follow up</li>
              </ol>
              <Link to="/hire-staff" className="inline-flex items-center gap-1 mt-3 font-semibold text-slate-800">
                Hire staff <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-md">
          <h2 className="text-lg font-bold mb-2">Need help now?</h2>
          <p className="text-white/90 text-sm mb-4">WhatsApp CareerJob — jobs or hiring.</p>
          <WhatsAppButton
            message="Hello CareerJob, I need help."
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl !h-11"
          />
          <p className="text-xs text-white/70 mt-3">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
