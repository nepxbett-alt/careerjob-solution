/**
 * Central configuration for CareerJob Solution.
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

export const LOCATIONS = [
  'All Nepal',
  'Pokhara',
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Chitwan',
  'Butwal',
  'Biratnagar',
  'Other',
] as const;

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
  name: 'CareerJob Solution',
  tagline: 'Find the right opportunity. Connect with the right people.',
  primaryColor: '#0066FF', // professional blue matching logo
} as const;
