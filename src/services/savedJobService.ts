import { supabase } from '../lib/supabase';

export async function getSavedJobs(candidateId: string) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('id, created_at, job_id, jobs(id, title, location, status, salary_display, job_type)')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveJob(candidateId: string, jobId: string) {
  const { error } = await supabase.from('saved_jobs').insert({
    candidate_id: candidateId,
    job_id: jobId,
  });
  if (error) {
    if (error.code === '23505') return; // already saved
    throw error;
  }
}

export async function unsaveJob(candidateId: string, jobId: string) {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId);
  if (error) throw error;
}

export async function isJobSaved(candidateId: string, jobId: string) {
  const { data } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId)
    .maybeSingle();
  return !!data;
}
