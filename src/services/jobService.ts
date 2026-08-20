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

  if (filters.location && filters.location !== 'All Nepal') {
    query = query.ilike('location', `%${filters.location}%`);
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
