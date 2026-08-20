/**
 * Format job location for display without inventing data or duplicating segments.
 */
export function formatJobLocation(
  location?: string | null,
  locationDetail?: string | null,
  opts?: { cityHint?: string },
): string {
  const cityHint = opts?.cityHint?.trim() || '';

  const parts = [locationDetail, location]
    .map((s) => (s || '').trim().replace(/\s+/g, ' '))
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

  // If a single segment already contains the city hint, don't append
  if (cityHint) {
    const hasCity = unique.some((u) => u.toLowerCase().includes(cityHint.toLowerCase()));
    if (!hasCity && unique.length === 1) {
      // Area-only like "Lakeside" → "Lakeside, Pokhara" when hint provided
      return `${unique[0]}, ${cityHint}`;
    }
  }

  return unique.join(', ');
}
