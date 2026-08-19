import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';

/** Compact, homepage-optimized job row — scannable in ~2 seconds */
export function HomeJobCard({ job, featured }: { job: Job; featured?: boolean }) {
  const locationLabel = job.location_detail
    ? `${job.location_detail}, ${job.location}`
    : job.location;

  if (featured) {
    return (
      <Link
        to={`/jobs/${job.id}`}
        className="group block relative overflow-hidden rounded-2xl border border-[#0066FF]/20 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,102,255,0.07)] hover:shadow-[0_8px_32px_rgba(0,102,255,0.12)] transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066FF] to-[#4D94FF]" aria-hidden />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-[#0066FF] mb-2">
              Featured opening
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220] group-hover:text-[#0066FF] transition-colors leading-snug">
              {job.title}
            </h3>
            {job.public_employer_label && (
              <p className="text-sm text-[#6B7789] mt-1">{job.public_employer_label}</p>
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
                <span className="text-sm font-semibold text-[#0B1220] bg-[#EEF4FF] text-[#0052CC] px-3 py-1 rounded-lg">
                  {job.salary_display}
                </span>
              )}
              <span className="text-sm text-[#3D4A5C] bg-[#F7F9FC] px-3 py-1 rounded-lg capitalize border border-[#E8ECF1]">
                {job.job_type.replace('-', ' ')}
              </span>
              {job.experience_required && (
                <span className="text-sm text-[#3D4A5C] bg-[#F7F9FC] px-3 py-1 rounded-lg border border-[#E8ECF1]">
                  {job.experience_required}
                </span>
              )}
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066FF] group-hover:gap-2 transition-all">
              View job
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex items-center gap-3 sm:gap-4 bg-white border border-[#E8ECF1] rounded-xl sm:rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 hover:border-[#0066FF]/30 hover:bg-[#FAFBFC] transition-all duration-150 active:scale-[0.995]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[0.95rem] sm:text-base text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug truncate">
            {job.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12px] sm:text-[13px] text-[#6B7789]">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" aria-hidden />
            {locationLabel}
          </span>
          {job.salary_display && (
            <span className="font-medium text-[#0B1220]">{job.salary_display}</span>
          )}
          <span className="capitalize hidden xs:inline">{job.job_type.replace('-', ' ')}</span>
          {job.published_at && (
            <span className="text-[#98A2B3] hidden sm:inline">
              {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
      <ArrowUpRight
        className="w-4.5 h-4.5 text-[#C5CDD8] group-hover:text-[#0066FF] shrink-0 transition-colors"
        aria-hidden
      />
    </Link>
  );
}
