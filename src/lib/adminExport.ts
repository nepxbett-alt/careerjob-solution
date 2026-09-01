/**
 * Admin data export helpers — CSV download for staff.
 * Uses the authenticated Supabase client (RLS: staff can read).
 */
import { supabase } from './supabase';

function escapeCsv(value: unknown): string {
  if (value == null) return '';
  const s = Array.isArray(value) ? value.join('; ') : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return '';
  const cols = columns || Object.keys(rows[0]);
  const header = cols.map(escapeCsv).join(',');
  const lines = rows.map((row) => cols.map((c) => escapeCsv(row[c])).join(','));
  return [header, ...lines].join('\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchAll(
  table: string,
  select: string,
  orderCol = 'created_at',
  pageSize = 1000,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  let from = 0;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderCol, { ascending: false })
      .range(from, to);
    if (error) throw error;
    const batch = (data || []) as unknown as Record<string, unknown>[];
    out.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
    if (from > 50000) break; // safety cap
  }
  return out;
}

const stamp = () => new Date().toISOString().slice(0, 10);

export async function exportCandidatesCsv() {
  const rows = await fetchAll(
    'candidate_profiles',
    'id, full_name, phone, email, location, desired_position, expected_salary, education, experience_years, experience_notes, skills, languages, seeker_status, registration_source, is_verified, created_at, updated_at',
  );
  const csv = rowsToCsv(rows);
  downloadTextFile(`careerjob-candidates-${stamp()}.csv`, csv);
  return rows.length;
}

export async function exportJobsCsv() {
  const rows = await fetchAll(
    'jobs',
    'id, title, location, location_detail, status, job_type, salary_min, salary_max, salary_display, experience_required, education_required, is_featured, approved_by_agency, public_employer_label, category_id, published_at, created_at, updated_at',
  );
  const csv = rowsToCsv(rows);
  downloadTextFile(`careerjob-jobs-${stamp()}.csv`, csv);
  return rows.length;
}

export async function exportApplicationsCsv() {
  const rows = await fetchAll(
    'applications',
    'id, job_id, candidate_id, status, application_reference, application_source, cover_message, applied_at, updated_at',
    'applied_at',
  );
  const csv = rowsToCsv(rows);
  downloadTextFile(`careerjob-applications-${stamp()}.csv`, csv);
  return rows.length;
}

export async function exportPlacementsCsv() {
  const rows = await fetchAll(
    'placements',
    'id, candidate_id, job_id, organization_id, position_title, salary, start_date, status, notes, created_at, updated_at',
  );
  const csv = rowsToCsv(rows);
  downloadTextFile(`careerjob-placements-${stamp()}.csv`, csv);
  return rows.length;
}

export async function exportOrganizationsCsv() {
  const rows = await fetchAll(
    'organizations',
    'id, name, phone, email, address, city, is_verified, created_at, updated_at',
  );
  const csv = rowsToCsv(rows);
  downloadTextFile(`careerjob-organizations-${stamp()}.csv`, csv);
  return rows.length;
}

/** Full JSON backup of core tables (staff-readable). */
export async function exportFullJsonBackup() {
  const [candidates, jobs, applications, placements, organizations] = await Promise.all([
    fetchAll(
      'candidate_profiles',
      'id, full_name, phone, email, location, desired_position, expected_salary, education, experience_years, experience_notes, skills, languages, seeker_status, registration_source, is_verified, user_id, created_at, updated_at',
    ),
    fetchAll(
      'jobs',
      'id, title, location, location_detail, status, job_type, salary_min, salary_max, salary_display, experience_required, education_required, description, requirements, responsibilities, benefits, is_featured, approved_by_agency, public_employer_label, category_id, organization_id, published_at, created_at, updated_at',
    ),
    fetchAll(
      'applications',
      'id, job_id, candidate_id, status, application_reference, application_source, cover_message, applied_at, updated_at',
      'applied_at',
    ),
    fetchAll(
      'placements',
      'id, candidate_id, job_id, organization_id, position_title, salary, start_date, status, notes, created_at, updated_at',
    ),
    fetchAll('organizations', 'id, name, phone, email, address, city, is_verified, created_at, updated_at'),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    counts: {
      candidates: candidates.length,
      jobs: jobs.length,
      applications: applications.length,
      placements: placements.length,
      organizations: organizations.length,
    },
    candidates,
    jobs,
    applications,
    placements,
    organizations,
  };

  downloadTextFile(
    `careerjob-full-backup-${stamp()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8',
  );
  return payload.counts;
}
