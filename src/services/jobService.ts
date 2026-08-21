import { supabase } from '../lib/supabase';

export interface Job {
  id: string;
  title: string;
  location: string;
  location_detail: string | null;
  salary_display: string | null;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string;
  experience_required: string | null;
  education_required: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  skills: string[] | null;
  benefits: string | null;
  application_deadline: string | null;
  status: string;
  public_employer_label: string | null;
  is_featured?: boolean;
  created_at: string;
  published_at: string | null;
  category_id: string | null;
  job_categories?: { name: string; slug: string } | null;
}

export interface JobFilters {
  q?: string;
  location?: string;
  category?: string;
  job_type?: string;
  page?: number;
  limit?: number;
}

const JOB_SELECT =
  'id, title, location, location_detail, salary_display, salary_min, salary_max, job_type, experience_required, education_required, description, responsibilities, requirements, skills, benefits, application_deadline, status, public_employer_label, is_featured, created_at, published_at, category_id, job_categories(name, slug)';

export async function searchJobs(filters: JobFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('jobs')
    .select(JOB_SELECT, { count: 'exact' })
    .eq('status', 'published')
    .eq('approved_by_agency', true)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false });

  // "All Pokhara" / PRIMARY_CITY = entire Pokhara-area inventory.
  // Migrated jobs often store area names only (Lakeside, New Road) without the word "Pokhara".
  // Do not require the literal city string in location for the default city view.
  if (
    filters.location &&
    filters.location !== 'All Nepal' &&
    filters.location !== 'All Pokhara' &&
    filters.location !== 'Pokhara'
  ) {
    query = query.or(
      `location.ilike.%${filters.location}%,location_detail.ilike.%${filters.location}%`
    );
  }
  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }
  if (filters.job_type) {
    query = query.eq('job_type', filters.job_type);
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { jobs: (data || []) as unknown as Job[], total: count || 0, page, limit };
}

/** Top jobs for homepage — admin-flagged featured first, then latest */
export async function getFeaturedJobs(limit = 6) {
  const { data: featured, error: fErr } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('status', 'published')
    .eq('approved_by_agency', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (fErr) throw fErr;

  const featuredList = (featured || []) as unknown as Job[];
  if (featuredList.length >= limit) {
    return featuredList.slice(0, limit);
  }

  const need = limit - featuredList.length;
  const excludeIds = featuredList.map((j) => j.id);

  let q = supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('status', 'published')
    .eq('approved_by_agency', true)
    .order('published_at', { ascending: false })
    .limit(need);

  if (excludeIds.length) {
    q = q.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: rest, error } = await q;
  if (error) throw error;
  return [...featuredList, ...((rest || []) as unknown as Job[])];
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('id', id)
    .eq('status', 'published')
    .eq('approved_by_agency', true)
    .single();

  if (error) throw error;
  return data as unknown as Job;
}

export async function setJobFeatured(jobId: string, featured: boolean) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ is_featured: featured })
    .eq('id', jobId)
    .select('id, is_featured')
    .single();
  if (error) throw error;
  return data;
}

export interface AdminCreateJobInput {
  title: string;
  location?: string;
  location_detail?: string | null;
  job_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_required?: string | null;
  education_required?: string | null;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  public_employer_label?: string | null;
  is_featured?: boolean;
  /** If true: status published + approved + published_at */
  publish?: boolean;
  created_by?: string | null;
}

function buildSalaryDisplay(min?: number | null, max?: number | null): string | null {
  if (min != null && max != null && min >= 1000 && max >= 1000) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    if (lo === hi) return `NPR ${lo}`;
    return `NPR ${lo}–${hi}`;
  }
  if (min != null && min >= 1000) return `NPR ${min}+`;
  if (max != null && max >= 1000) return `Up to NPR ${max}`;
  return null;
}

/** Staff/admin creates a vacancy directly (walk-in employer or internal listing). */
export async function createAdminJob(input: AdminCreateJobInput) {
  const title = (input.title || '').trim();
  if (!title) throw new Error('Job title is required');

  let salaryMin = input.salary_min ?? null;
  let salaryMax = input.salary_max ?? null;
  if (salaryMin != null && salaryMin < 1000) salaryMin = null;
  if (salaryMax != null && salaryMax < 1000) salaryMax = null;
  if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
    const t = salaryMin;
    salaryMin = salaryMax;
    salaryMax = t;
  }

  const publish = !!input.publish;
  const location = (input.location || 'Pokhara').trim() || 'Pokhara';
  const locationDetail = (input.location_detail || '').trim() || null;

  const row = {
    title,
    location,
    location_detail: locationDetail,
    job_type: input.job_type || 'full-time',
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_display: buildSalaryDisplay(salaryMin, salaryMax),
    experience_required: (input.experience_required || '').trim() || null,
    education_required: (input.education_required || '').trim() || null,
    description: (input.description || '').trim() || null,
    responsibilities: (input.responsibilities || '').trim() || null,
    requirements: (input.requirements || '').trim() || null,
    benefits: (input.benefits || '').trim() || null,
    public_employer_label: (input.public_employer_label || '').trim() || null,
    is_featured: !!input.is_featured,
    status: publish ? 'published' : 'draft',
    approved_by_agency: publish,
    published_at: publish ? new Date().toISOString() : null,
    created_by: input.created_by || null,
    employer_name_private: true,
  };

  const { data, error } = await supabase.from('jobs').insert(row).select('id, title, status').single();
  if (error) throw error;
  return data;
}
