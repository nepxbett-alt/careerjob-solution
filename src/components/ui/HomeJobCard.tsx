import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, Star, MessageCircle } from 'lucide-react';
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

/** Homepage job presentation — featured + compact rows */
export function HomeJobCard({ job, featured }: { job: Job; featured?: boolean }) {
  const { lang } = useI18n();
  const locationLabel =
    formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' }) || 'Pokhara';
  const title = formatJobTitle(job.title) || job.title;
  const salary = formatSalaryDisplay(job.salary_display, job.salary_min, job.salary_max);
  const jobType = formatJobType(job.job_type);
  const employer = formatEmployerLabel(job.public_employer_label);
  const isTop = featured || !!job.is_featured;
  const waHref = buildJobWhatsAppUrl(job, lang);

  if (isTop && featured) {
    return (
      <article className="relative overflow-hidden rounded-2xl border border-[#0066FF]/20 bg-white shadow-[0_4px_20px_rgba(0,102,255,0.06)] hover:shadow-[0_10px_28px_rgba(0,102,255,0.1)] transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0066FF]" aria-hidden />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to={`/jobs/${job.id}`} className="group min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0066FF] mb-2">
              <Star className="w-3 h-3 fill-current" aria-hidden />
              Featured
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1220] group-hover:text-[#0066FF] transition-colors leading-snug">
              {title}
            </h3>
            {employer && <p className="text-sm text-[#6B7789] mt-1.5">{employer}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-[#3D4A5C]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#98A2B3]" aria-hidden />
                {locationLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {salary && (
                <span className="text-sm font-semibold text-[#0B1220] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
                  {salary}
                </span>
              )}
              {jobType && (
                <span className="text-sm text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
                  {jobType}
                </span>
              )}
            </div>
          </Link>
          <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#0066FF] text-white text-sm font-semibold hover:bg-[#0052CC] transition-colors"
            >
              View job
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl border border-[#E8ECF1] text-sm font-medium text-[#3D4A5C] hover:border-[#25D366]/40 hover:text-[#128C7E] transition-colors"
              aria-label={`Contact CareerJob about ${title} on WhatsApp`}
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex items-center gap-2 bg-white border border-[#E8ECF1] rounded-xl sm:rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 hover:border-[#0066FF]/25 hover:shadow-sm transition-all duration-150">
      <Link to={`/jobs/${job.id}`} className="group flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[0.95rem] sm:text-base text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug truncate">
              {title}
            </h3>
            {job.is_featured && (
              <Star className="w-3.5 h-3.5 text-[#0066FF] fill-[#0066FF] shrink-0" aria-label="Featured" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[12px] sm:text-[13px] text-[#6B7789]">
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" aria-hidden />
              {locationLabel}
            </span>
            {salary && <span className="font-semibold text-[#0B1220]">{salary}</span>}
            {jobType && <span>{jobType}</span>}
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#C5CDD8] group-hover:text-[#0066FF] shrink-0 transition-colors" aria-hidden />
      </Link>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#98A2B3] hover:text-[#128C7E] hover:bg-[#ECFDF5] shrink-0 transition-colors"
        aria-label={`Contact CareerJob about ${title} on WhatsApp`}
      >
        <MessageCircle className="w-4.5 h-4.5" aria-hidden />
      </a>
    </article>
  );
}
