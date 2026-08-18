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

export async function searchJobs(filters: JobFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('jobs')
    .select('*, job_categories(name, slug)', { count: 'exact' })
    .eq('status', 'published')
    .eq('approved_by_agency', true)
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
  return { jobs: (data || []) as Job[], total: count || 0, page, limit };
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_categories(name, slug)')
    .eq('id', id)
    .eq('status', 'published')
    .eq('approved_by_agency', true)
    .single();

  if (error) throw error;
  return data as Job;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('job_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}
