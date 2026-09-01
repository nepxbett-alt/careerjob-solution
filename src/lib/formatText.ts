/**
 * Display-only text polish for CareerJob.
 * Does not mutate stored data — formats for UI only.
 */

/** Title-case words while preserving short acronyms */
function titleCaseWord(w: string): string {
  if (!w) return w;
  // Keep all-caps short tokens (e.g. KM, NPR) when already uppercase and short
  if (w.length <= 3 && w === w.toUpperCase() && /[A-Z]/.test(w)) return w;
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/**
 * Clean messy migrated job titles for display.
 * e.g. "billing.reception" → "Billing Reception"
 *      "Head chefi\\ cook" → "Head Chefi Cook"
 *      "computer teacher" → "Computer Teacher"
 */
export function formatJobTitle(raw?: string | null): string {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';

  // Normalize separators often found in legacy data
  s = s
    .replace(/\\+/g, ' ')
    .replace(/[._/|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return s
    .split(' ')
    .filter(Boolean)
    .map(titleCaseWord)
    .join(' ');
}

/**
 * Soft title-case for place names: "ratnachowk" → "Ratnachowk"
 * Leaves multi-word already mixed case mostly intact after trim.
 */
export function formatPlaceName(raw?: string | null): string {
  if (!raw) return '';
  let s = String(raw).trim().replace(/\s+/g, ' ');
  if (!s) return '';
  // If entire string is lowercase or UPPER, title-case words
  const isUniform =
    s === s.toLowerCase() || s === s.toUpperCase();
  if (isUniform) {
    return s
      .split(/([\s,-]+)/)
      .map((part) => {
        if (/^[\s,-]+$/.test(part)) return part;
        return titleCaseWord(part);
      })
      .join('');
  }
  // Mixed case: only capitalize first letter if starts lowercase
  if (s[0] === s[0].toLowerCase()) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

/** Job type labels for display */
const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
  freelance: 'Freelance',
};

export function formatJobType(raw?: string | null): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase().replace(/\s+/g, '-');
  if (JOB_TYPE_LABELS[key]) return JOB_TYPE_LABELS[key];
  // Fallback: title-case with hyphen normalized
  return raw
    .trim()
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join('-')
    .replace(/- /g, '-');
}

/**
 * Professional salary chip. Hides nonsense migrated values.
 * Returns null when salary should not be shown.
 */
export function formatSalaryDisplay(
  salaryDisplay?: string | null,
  salaryMin?: number | null,
  salaryMax?: number | null,
): string | null {
  const min = salaryMin != null && Number.isFinite(Number(salaryMin)) ? Number(salaryMin) : null;
  const max = salaryMax != null && Number.isFinite(Number(salaryMax))
    ? Number(salaryMax)
    : null;

  // Prefer numeric fields when present
  if (min != null || max != null) {
    // Reject absurd / placeholder ranges (common in bad migrations)
    const vals = [min, max].filter((v): v is number => v != null);
    if (vals.some((v) => v < 1000)) return null; // e.g. 1–2
    if (vals.every((v) => v === 0)) return null;
    if (min != null && max != null && min === max) {
      if (min < 1000) return null;
      return `NPR ${min.toLocaleString('en-NP')}`;
    }
    if (min != null && max != null) {
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      if (hi < 1000) return null;
      return `NPR ${lo.toLocaleString('en-NP')}–${hi.toLocaleString('en-NP')}`;
    }
    if (min != null && min >= 1000) return `NPR ${min.toLocaleString('en-NP')}+`;
    if (max != null && max >= 1000) return `Up to NPR ${max.toLocaleString('en-NP')}`;
  }

  // Fallback: parse salary_display string
  const raw = (salaryDisplay || '').trim();
  if (!raw) return null;

  // Extract numbers
  const nums = raw.replace(/,/g, '').match(/\d+/g)?.map(Number) || [];
  if (nums.length && nums.every((n) => n < 1000)) return null;
  if (nums.length === 2 && nums[0] === nums[1] && nums[0] >= 1000) {
    return `NPR ${nums[0].toLocaleString('en-NP')}`;
  }
  if (nums.length >= 2) {
    const lo = Math.min(nums[0], nums[1]);
    const hi = Math.max(nums[0], nums[1]);
    if (hi < 1000) return null;
    return `NPR ${lo.toLocaleString('en-NP')}–${hi.toLocaleString('en-NP')}`;
  }
  if (nums.length === 1 && nums[0] >= 1000) {
    return `NPR ${nums[0].toLocaleString('en-NP')}`;
  }

  // Non-numeric phrases like "Negotiable"
  const lower = raw.toLowerCase();
  if (lower.includes('negotiable') || lower.includes('competitive')) return raw;
  // If string looks like garbage, hide
  if (/^npr\s*0/i.test(raw)) return null;
  return raw;
}

/**
 * Only show employer label when it is a real public name, not a generic badge.
 */
export function formatEmployerLabel(raw?: string | null): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  const generic = [
    'verified employer',
    'verified',
    'employer',
    'confidential',
    'n/a',
    'na',
    'unknown',
    'company',
  ];
  if (generic.includes(s.toLowerCase())) return null;
  return s;
}
