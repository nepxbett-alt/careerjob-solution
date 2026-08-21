/**
 * Centralized WhatsApp contact helpers for CareerJob Solution.
 * Only public-safe job fields are included in messages.
 */
import { CONTACT, WHATSAPP_BASE } from './config';
import { formatJobLocation } from './formatLocation';
import { formatJobTitle } from './formatText';
import type { Lang } from './i18n';

/** Minimal job shape for WhatsApp — public fields only */
export interface WhatsAppJobInput {
  id: string;
  title?: string | null;
  location?: string | null;
  location_detail?: string | null;
  /** Optional public-facing reference if the product exposes one later */
  public_reference?: string | null;
}

const SITE_ORIGIN =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://careerjobsolution.com.np';

function safeTitle(job: WhatsAppJobInput): string | null {
  const t = formatJobTitle(job.title) || (job.title || '').trim();
  if (!t || t.toLowerCase() === 'undefined' || t.toLowerCase() === 'null') return null;
  return t;
}

function safeLocation(job: WhatsAppJobInput): string | null {
  const loc = formatJobLocation(job.location, job.location_detail, { cityHint: 'Pokhara' });
  if (!loc || loc.toLowerCase() === 'undefined' || loc.toLowerCase() === 'null') return null;
  return loc;
}

function publicJobUrl(job: WhatsAppJobInput): string {
  return `${SITE_ORIGIN}/jobs/${job.id}`;
}

/**
 * Build a pre-filled WhatsApp message for a specific job vacancy.
 * Language follows the site EN | नेपाली preference.
 */
export function buildJobWhatsAppMessage(job: WhatsAppJobInput, lang: Lang = 'en'): string {
  const title = safeTitle(job);
  const location = safeLocation(job);
  const url = publicJobUrl(job);
  const ref = (job.public_reference || '').trim() || null;

  if (lang === 'ne') {
    const lines: string[] = ['नमस्कार CareerJob Solution 👋', ''];
    if (title) {
      lines.push(`म "${title}" पदका लागि रुचि राख्दैछु।`);
    } else {
      lines.push('म CareerJob Solution मा सूचीकृत एक vacancy का लागि रुचि राख्दैछु।');
    }
    if (location) {
      lines.push(`स्थान: "${location}"`);
    }
    if (ref) {
      lines.push(`Job Reference: ${ref}`);
    }
    lines.push('');
    lines.push('यो vacancy मैले CareerJob Solution मा भेटेको हुँ। आवेदन कसरी दिने भन्नेबारे थप जानकारी चाहन्छु।');
    lines.push('');
    lines.push(`Job: ${url}`);
    lines.push('');
    lines.push('धन्यवाद।');
    return lines.join('\n');
  }

  // English
  const lines: string[] = ['Hello CareerJob Solution 👋', ''];
  if (title) {
    if (location) {
      lines.push(`I am interested in the "${title}" position in "${location}".`);
    } else {
      lines.push(`I am interested in the "${title}" position.`);
    }
  } else {
    lines.push('I am interested in a job vacancy listed on CareerJob Solution.');
  }
  if (ref) {
    lines.push(`Job Reference: ${ref}`);
  }
  lines.push('');
  lines.push(
    'I found this vacancy on CareerJob Solution and would like to know more about how to apply.',
  );
  lines.push('');
  lines.push(`Job: ${url}`);
  lines.push('');
  lines.push('Thank you.');
  return lines.join('\n');
}

/** WhatsApp deep link for a specific job */
export function buildJobWhatsAppUrl(job: WhatsAppJobInput, lang: Lang = 'en'): string {
  const message = buildJobWhatsAppMessage(job, lang);
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

/** Generic (non-job) WhatsApp link — uses CONTACT.whatsapp via WHATSAPP_BASE */
export function buildGenericWhatsAppUrl(message?: string): string {
  if (!message) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_NUMBER = CONTACT.whatsapp;
