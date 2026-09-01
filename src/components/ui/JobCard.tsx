import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';
import { formatJobLocation } from '../../lib/formatLocation';
import {
  formatJobTitle,
  formatJobType,
  formatSalaryDisplay,
  formatEmployerLabel,
} from '../../lib/formatText';
import { buildJobWhatsAppUrl } from '../../lib/whatsapp';
import { useI18n } from '../../lib/i18n';

export function JobCard({ job }: { job: Job }) {
  const { lang } = useI18n();
  const locationLabel = formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' });
  const title = formatJobTitle(job.title) || job.title;
  const featured = !!job.is_featured;
  const salary = formatSalaryDisplay(job.salary_display, job.salary_min, job.salary_max);
  const jobType = formatJobType(job.job_type);
  const employer = formatEmployerLabel(job.public_employer_label);
  const waHref = buildJobWhatsAppUrl(job, lang);

  return (
    <article
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        featured
          ? 'border-[#0066FF]/30 shadow-[0_4px_20px_rgba(0,102,255,0.07)]'
          : 'border-[#E8ECF1] shadow-[0_1px_2px_rgba(11,18,32,0.04)] hover:border-[#0066FF]/22 hover:shadow-[0_8px_24px_rgba(11,18,32,0.05)]'
      }`}
    >
      {featured && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0066FF]" aria-hidden />}

      <Link to={`/jobs/${job.id}`} className="block p-4 sm:p-5">
        <div className="min-w-0">
          {featured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0066FF] mb-1.5">
              <Star className="w-3 h-3 fill-current" aria-hidden />
              Featured
            </span>
          )}
          <h2 className="font-semibold text-[1.05rem] sm:text-lg text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug">
            {title}
          </h2>
          {employer && <p className="text-sm text-[#6B7789] mt-1 truncate">{employer}</p>}
          {(job.job_code || job.id) && (
            <p className="text-[11px] font-mono text-[#98A2B3] mt-1">
              {job.job_code || `ID ${job.id.slice(0, 8)}`}
            </p>
          )}
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

        {(salary || jobType) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {salary && (
              <span className="text-[13px] font-semibold text-[#0B1220] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
                {salary}
              </span>
            )}
            {jobType && (
              <span className="text-[13px] text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
                {jobType}
              </span>
            )}
          </div>
        )}
        {(job.education_required || job.experience_required) && (
          <p className="text-[12px] text-[#6B7789] mt-2.5 truncate">
            {[job.education_required, job.experience_required].filter(Boolean).join(' · ')}
          </p>
        )}
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-t border-[#F1F5F9] bg-[#FAFBFC]">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7789] hover:text-[#128C7E] min-h-[36px] transition-colors"
          aria-label={`Contact CareerJob about ${title} on WhatsApp`}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="w-3.5 h-3.5" aria-hidden />
          WhatsApp
        </a>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF] hover:gap-1.5 transition-all min-h-[36px]"
        >
          View & apply
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
