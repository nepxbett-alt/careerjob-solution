import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowUpRight, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';
import { formatJobLocation } from '../../lib/formatLocation';
import { formatJobTitle } from '../../lib/formatText';
import { WhatsAppButton } from '../WhatsAppButton';

/** Homepage job presentation — featured hero + compact top jobs */
export function HomeJobCard({ job, featured }: { job: Job; featured?: boolean }) {
  const locationLabel =
    formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' }) || 'Pokhara';
  const isTop = featured || !!job.is_featured;

  if (isTop && featured) {
    return (
      <article className="relative overflow-hidden rounded-2xl border border-[#0066FF]/20 bg-white shadow-[0_4px_24px_rgba(0,102,255,0.08)] hover:shadow-[0_12px_36px_rgba(0,102,255,0.12)] transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066FF] via-[#3D8BFF] to-[#0066FF]" aria-hidden />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to={`/jobs/${job.id}`} className="group min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-2.5">
              <Star className="w-3.5 h-3.5 fill-current" aria-hidden />
              Featured
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220] group-hover:text-[#0066FF] transition-colors leading-snug">
              {formatJobTitle(job.title) || job.title}
            </h3>
            {job.public_employer_label && (
              <p className="text-sm text-[#6B7789] mt-1.5">{job.public_employer_label}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-[#3D4A5C]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#98A2B3]" aria-hidden />
                {locationLabel}
              </span>
              {job.published_at && (
                <span className="inline-flex items-center gap-1.5 text-[#6B7789]">
                  <Clock className="w-4 h-4 text-[#98A2B3]" aria-hidden />
                  {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {job.salary_display && (
                <span className="text-sm font-semibold text-[#0052CC] bg-[#EEF4FF] px-3 py-1.5 rounded-lg">
                  {job.salary_display}
                </span>
              )}
              <span className="text-sm text-[#3D4A5C] bg-[#F7F9FC] px-3 py-1.5 rounded-lg capitalize border border-[#E8ECF1]">
                {job.job_type.replace('-', ' ')}
              </span>
              {job.experience_required && (
                <span className="text-sm text-[#3D4A5C] bg-[#F7F9FC] px-3 py-1.5 rounded-lg border border-[#E8ECF1]">
                  {job.experience_required}
                </span>
              )}
              {job.job_categories?.name && (
                <span className="text-sm text-[#0066FF] bg-[#EEF4FF] px-3 py-1.5 rounded-lg">
                  {job.job_categories.name}
                </span>
              )}
            </div>
          </Link>
          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <WhatsAppButton job={job} source="home_featured" label="WhatsApp" className="!h-10 !text-sm" />
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066FF] hover:gap-2.5 transition-all min-h-[40px]"
            >
              View job
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex items-center gap-2 sm:gap-3 bg-white border border-[#E8ECF1] rounded-xl sm:rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 hover:border-[#0066FF]/30 hover:shadow-sm transition-all duration-150">
      <Link
        to={`/jobs/${job.id}`}
        className="group flex items-center gap-3 sm:gap-4 min-w-0 flex-1 active:scale-[0.995]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[0.95rem] sm:text-base text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug truncate">
              {formatJobTitle(job.title) || job.title}
            </h3>
            {job.is_featured && (
              <Star className="w-3.5 h-3.5 text-[#0066FF] fill-[#0066FF] shrink-0" aria-label="Featured" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12px] sm:text-[13px] text-[#6B7789]">
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" aria-hidden />
              {locationLabel}
            </span>
            {job.salary_display && (
              <span className="font-semibold text-[#0B1220]">{job.salary_display}</span>
            )}
            <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
          </div>
        </div>
        <ArrowUpRight
          className="w-4.5 h-4.5 text-[#C5CDD8] group-hover:text-[#0066FF] shrink-0 transition-colors"
          aria-hidden
        />
      </Link>
      <WhatsAppButton
        job={job}
        source="home_latest"
        label=""
        className="!h-9 !w-9 !px-0 !rounded-lg shrink-0"
      />
    </article>
  );
}
