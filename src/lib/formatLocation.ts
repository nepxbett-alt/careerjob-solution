/**
 * Format job location for display without inventing data or duplicating segments.
 */
import { formatPlaceName } from './formatText';

export function formatJobLocation(
  location?: string | null,
  locationDetail?: string | null,
  opts?: { cityHint?: string },
): string {
  const cityHint = opts?.cityHint?.trim() || '';

  const parts = [locationDetail, location]
    .map((s) => formatPlaceName(s))
    .filter(Boolean);

  // Dedupe case-insensitive exact matches while preserving first casing
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }

  if (unique.length === 0) {
    return cityHint || '';
  }

  if (cityHint) {
    const hasCity = unique.some((u) => u.toLowerCase().includes(cityHint.toLowerCase()));
    if (!hasCity && unique.length === 1) {
      return `${unique[0]}, ${cityHint}`;
    }
  }

  return unique.join(', ');
}
