/**
 * Central configuration for Career Job Solution.
 * Public contact values are safe to expose.
 * Never put secrets here.
 */

export const CONTACT = {
  whatsapp: '9802858215',
  phones: ['9802858215', '9802858216', '9802858217'],
  primaryPhone: '9802858215',
  email: 'Solutioncareerjob32@gmail.com',
  address: 'Srijana Chowk, Pokhara, Nepal',
  officeHours: 'Sunday – Friday, 9:00 AM – 6:00 PM',
  mapsUrl: 'https://maps.google.com/?q=Srijana+Chowk+Pokhara+Nepal',
} as const;

export const WHATSAPP_BASE = `https://wa.me/977${CONTACT.whatsapp}`;

export function getWhatsAppLink(message?: string): string {
  if (!message) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

/** Primary market — Pokhara only */
export const PRIMARY_CITY = 'Pokhara' as const;

/** Pokhara area filters (optional detail, not other cities) */
export const POKHARA_AREAS = [
  'All Pokhara',
  'Lakeside',
  'New Road',
  'Srijana Chowk',
  'Mahendrapool',
  'Zero KM',
  'Chipledhunga',
  'Birauta',
  'Hemja',
  'Other Pokhara',
] as const;

/** @deprecated use POKHARA_AREAS — kept so old imports do not break */
export const LOCATIONS = POKHARA_AREAS;

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
] as const;

export const APPLICATION_STATUSES = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'placed',
  'rejected',
  'withdrawn',
  'closed',
] as const;

export const BRAND = {
  name: 'Career Job Solution',
  tagline: 'Jobs in Pokhara. Real recruitment support.',
  primaryColor: '#0066FF',
} as const;
