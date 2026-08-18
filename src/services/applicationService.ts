import { supabase } from '../lib/supabase';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  cover_message: string | null;
  applied_at: string;
  jobs?: { title: string; location: string; status: string } | null;
  candidate_profiles?: { full_name: string; phone: string; location: string | null; cv_url: string | null } | null;
}

export async function applyToJob(params: {
  jobId: string;
  candidateId: string;
  coverMessage?: string;
}) {
  // prevent duplicate via unique constraint; also check first for friendly error
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', params.jobId)
    .eq('candidate_id', params.candidateId)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already applied to this job.');
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: params.jobId,
      candidate_id: params.candidateId,
      status: 'applied',
      cover_message: params.coverMessage || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('You have already applied to this job.');
    throw error;
  }

  // history row
  await supabase.from('application_status_history').insert({
    application_id: data.id,
    from_status: null,
    to_status: 'applied',
  });

  return data;
}

export async function getMyApplications(candidateId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs(title, location, status)')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Application[];
}

export async function getAllApplications(filters?: { status?: string }) {
  let q = supabase
    .from('applications')
    .select('*, jobs(title, location), candidate_profiles(full_name, phone, location, cv_url)')
    .order('applied_at', { ascending: false });

  if (filters?.status) q = q.eq('status', filters.status);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as Application[];
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)
    .select()
    .single();
  if (error) throw error;

  // history is also written by trigger; notes can go to audit if needed
  if (notes) {
    await supabase.from('application_status_history').insert({
      application_id: applicationId,
      to_status: newStatus,
      notes,
    });
  }
  return data;
}
