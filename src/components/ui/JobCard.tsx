import { Link } from 'react-router-dom';
import { WhatsAppButton } from '../WhatsAppButton';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';
import { formatJobLocation } from '../../lib/formatLocation';
import { formatJobTitle } from '../../lib/formatText';

export function JobCard({ job }: { job: Job }) {
  const locationLabel = formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' });
  const featured = !!job.is_featured;

  return (
    <article
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        featured
          ? 'border-[#0066FF]/25 shadow-[0_4px_20px_rgba(0,102,255,0.08)]'
          : 'border-[#E8ECF1] shadow-[0_1px_2px_rgba(11,18,32,0.04)] hover:border-[#0066FF]/25 hover:shadow-[0_8px_24px_rgba(11,18,32,0.06)]'
      }`}
    >
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0066FF]" aria-hidden />
      )}

      <Link to={`/jobs/${job.id}`} className="block p-4 sm:p-5 active:bg-slate-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0066FF] mb-1.5">
                <Star className="w-3 h-3 fill-current" aria-hidden />
                Top in Pokhara
              </span>
            )}
            <h2 className="font-semibold text-[1.05rem] sm:text-lg text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug">
              {formatJobTitle(job.title) || job.title}
            </h2>
            {job.public_employer_label && (
              <p className="text-sm text-[#6B7789] mt-1 truncate">{job.public_employer_label}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[13px] text-[#3D4A5C]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" aria-hidden />
            {locationLabel || 'Pokhara'}
          </span>
          {job.published_at && (
            <span className="inline-flex items-center gap-1.5 text-[#6B7789]">
              <Clock className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" aria-hidden />
              {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.salary_display && (
            <span className="text-[13px] font-semibold text-[#0B1220] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
              {job.salary_display}
            </span>
          )}
          <span className="text-[13px] text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg capitalize">
            {job.job_type.replace('-', ' ')}
          </span>
          {job.experience_required && (
            <span className="text-[13px] text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg">
              {job.experience_required}
            </span>
          )}
          {job.job_categories?.name && (
            <span className="text-[13px] text-[#0066FF] bg-[#EEF4FF] px-2.5 py-1 rounded-lg">
              {job.job_categories.name}
            </span>
          )}
        </div>
      </Link>

      {/* Functional footer: clear next actions */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-[#F1F5F9] bg-[#FAFBFC]">
        <span className="text-xs text-[#6B7789] truncate min-w-0">
          {job.application_deadline
            ? `Apply by ${new Date(job.application_deadline).toLocaleDateString()}`
            : 'Open for applications'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <WhatsAppButton
            job={job}
            source="job_card"
            label="WhatsApp"
            className="!h-9 !px-2.5 !text-xs !rounded-lg"
          />
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF] hover:gap-1.5 transition-all min-h-[36px]"
          >
            View & apply
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
