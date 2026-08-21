import { formatJobLocation } from '../lib/formatLocation';
import { formatJobTitle } from '../lib/formatText';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { getJobById } from '../services/jobService';
import type { Job } from '../services/jobService';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useAuth } from '../contexts/AuthContext';
import { getMyCandidateProfile, type CandidateProfile } from '../services/candidateService';
import { computeMatchScore } from '../lib/matchScore';
import { isJobSaved, saveJob, unsaveJob } from '../services/savedJobService';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/Seo';
import { PublicApplyForm } from '../components/PublicApplyForm';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [candProfile, setCandProfile] = useState<CandidateProfile | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJobById(id)
      .then(async (j) => {
        setJob(j);
        if (user) {
          try {
            const profile = await getMyCandidateProfile(user.id);
            if (profile) {
              setCandProfile(profile);
              setSaved(await isJobSaved(profile.id, j.id));
            }
          } catch { /* ignore */ }
        }
      })
      .catch(() => setError('This job is not available or has been closed.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = () => {
    // Public apply — no login required
    setShowApply(true);
    // Scroll form into view on mobile after paint
    setTimeout(() => {
      document.getElementById('public-apply-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSave = async () => {
    if (!user || !job) {
      navigate('/login?redirect=/jobs/' + id);
      return;
    }
    setSaveBusy(true);
    try {
      const profile = await getMyCandidateProfile(user.id);
      if (!profile) {
        navigate('/candidate/profile');
        return;
      }
      if (saved) {
        await unsaveJob(profile.id, job.id);
        setSaved(false);
      } else {
        await saveJob(profile.id, job.id);
        setSaved(true);
      }
    } catch (e: any) {
      alert(e.message || 'Could not update saved jobs');
    } finally {
      setSaveBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="cj-container max-w-3xl py-10 space-y-4" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="cj-container max-w-3xl py-16 text-center">
        <p className="text-[#3D4A5C] mb-4">{error || 'Job not found'}</p>
        <Link to="/jobs"><Button>Back to jobs</Button></Link>
      </div>
    );
  }

  const locationLabel = formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' }) || job.location;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://careerjobsolution.com.np';
  const canonical = `${origin}/jobs/${job.id}`;
  const desc = (job.description || `${job.title} in ${job.location}. Apply via CareerJob Solution.`).slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.title,
    datePosted: job.published_at || job.created_at,
    employmentType: (job.job_type || 'FULL_TIME').toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.public_employer_label || 'CareerJob Solution',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'NP',
      },
    },
    ...(job.application_deadline ? { validThrough: job.application_deadline } : {}),
  };

  return (
    <div className="cj-container max-w-3xl py-8 pb-28 md:pb-12">
      <Seo
        title={`${job.title} in ${job.location} | CareerJob Solution`}
        description={desc}
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-[#6B7789] hover:text-[#0066FF] mb-6 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" aria-hidden /> Back to jobs
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1220] tracking-tight mb-3">{formatJobTitle(job.title) || job.title}</h1>
        {job.public_employer_label && (
          <p className="text-[#6B7789] mb-3">{job.public_employer_label}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#3D4A5C]">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#98A2B3]" aria-hidden />{locationLabel}</span>
          {job.job_categories?.name && (
            <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#98A2B3]" aria-hidden />{job.job_categories.name}</span>
          )}
          {job.published_at && (
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#98A2B3]" aria-hidden />{formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {job.salary_display && (
            <span className="font-medium bg-[#EEF2F7] text-[#0B1220] px-3 py-1 rounded-lg text-sm">{job.salary_display}</span>
          )}
          <span className="bg-[#F7F9FC] text-[#3D4A5C] px-3 py-1 rounded-lg text-sm capitalize">{job.job_type.replace('-', ' ')}</span>
          {job.experience_required && (
            <span className="bg-[#F7F9FC] text-[#3D4A5C] px-3 py-1 rounded-lg text-sm">{job.experience_required}</span>
          )}
        </div>
      </header>

      {(() => {
        const meaningful = (v: string | null | undefined) => {
          if (!v) return false;
          const s = String(v).trim();
          if (!s || s === '[]' || s === '{}') return false;
          return true;
        };
        const hasDesc = meaningful(job.description);
        const hasReq = meaningful(job.requirements);
        const hasResp = meaningful(job.responsibilities);
        const hasBen = meaningful(job.benefits);
        const any = hasDesc || hasReq || hasResp || hasBen;
        return (
          <>
            {hasDesc && (
              <section className="mb-8">
                <h2 className="font-semibold text-lg text-[#0B1220] mb-2">About this role</h2>
                <div className="text-[#3D4A5C] whitespace-pre-wrap leading-relaxed text-[0.95rem]">{job.description}</div>
              </section>
            )}
            {hasResp && (
              <section className="mb-8">
                <h2 className="font-semibold text-lg text-[#0B1220] mb-2">Responsibilities</h2>
                <div className="text-[#3D4A5C] whitespace-pre-wrap leading-relaxed text-[0.95rem]">{job.responsibilities}</div>
              </section>
            )}
            {hasReq && (
              <section className="mb-8">
                <h2 className="font-semibold text-lg text-[#0B1220] mb-2">Requirements</h2>
                <div className="text-[#3D4A5C] whitespace-pre-wrap leading-relaxed text-[0.95rem]">{job.requirements}</div>
              </section>
            )}
            {hasBen && (
              <section className="mb-8">
                <h2 className="font-semibold text-lg text-[#0B1220] mb-2">Benefits</h2>
                <div className="text-[#3D4A5C] whitespace-pre-wrap leading-relaxed text-[0.95rem]">{job.benefits}</div>
              </section>
            )}
            {!any && (
              <p className="text-sm text-[#6B7789] mb-6 rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] px-4 py-3">
                Additional role details were not provided by the employer. CareerJob can share more information during the recruitment process.
              </p>
            )}
          </>
        );
      })()}

      <p className="text-xs text-[#98A2B3] mb-8 leading-relaxed">
        Employer details and exact interview information may be provided by CareerJob during the recruitment process.
      </p>

      {/* Desktop actions */}
      <div className="hidden md:flex flex-wrap gap-3 items-center">
        {candProfile && (() => {
          const m = computeMatchScore({
            jobTitle: job.title,
            jobLocation: job.location,
            jobSkills: job.skills,
            jobExperience: job.experience_required,
            jobEducation: job.education_required,
            candidateSkills: candProfile.skills,
            candidateLocation: candProfile.location,
            candidateEducation: candProfile.education,
            candidateExperienceYears: candProfile.experience_years,
            desiredPosition: (candProfile as { desired_position?: string | null }).desired_position || candProfile.headline,
          });
          return (
            <div className="rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] p-4 mb-4">
              <p className="text-sm font-semibold text-[#0B1220]">
                <span className="text-[#0066FF] text-lg tabular-nums">{m.score}%</span> profile match
              </p>
              <ul className="mt-2 space-y-1">
                {m.reasons.slice(0, 5).map((r) => (
                  <li key={r.text} className={`text-xs ${r.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {r.ok ? '✓' : '⚠'} {r.text}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#98A2B3] mt-2">Guidance only — not a hiring decision.</p>
            </div>
          );
        })()}
        {!showApply && (
          <>
            <Button size="lg" onClick={handleApply}>Apply for this job</Button>
            <Button size="lg" variant="outline" onClick={handleSave} loading={saveBusy} aria-pressed={saved}>
              {saved ? <BookmarkCheck className="w-4 h-4" aria-hidden /> : <Bookmark className="w-4 h-4" aria-hidden />}
              {saved ? 'Saved' : 'Save job'}
            </Button>
            <WhatsAppButton job={job} label="Ask CareerJob" source="job_detail" />
          </>
        )}
      </div>

      {showApply && (
        <div id="public-apply-form" className="mt-8 rounded-2xl border border-[#E8ECF1] bg-white p-5 sm:p-6 shadow-sm">
          <PublicApplyForm
            jobId={job.id}
            jobTitle={job.title}
            onClose={() => setShowApply(false)}
          />
        </div>
      )}

      {/* Mobile sticky CTA — hidden while applying */}
      {!showApply && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-[#E8ECF1] safe-bottom md:hidden z-30">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="shrink-0 min-w-[48px] px-3"
              onClick={handleSave}
              loading={saveBusy}
              aria-label={saved ? 'Unsave job' : 'Save job'}
            >
              {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </Button>
            <Button fullWidth size="lg" onClick={handleApply}>
              Apply for this job
            </Button>
            <WhatsAppButton
              job={job}
              source="job_detail_mobile_sticky"
              className="shrink-0 !px-3 !w-12 !h-11 !rounded-[10px]"
              label=""
            />
          </div>
        </div>
      )}
    </div>
  );
}
