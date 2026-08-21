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
