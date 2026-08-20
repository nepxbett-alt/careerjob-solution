import { supabase } from '../lib/supabase';
import { createNotification } from './notificationService';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  cover_message: string | null;
  applied_at: string;
  jobs?: { title: string; location: string; status: string } | null;
  candidate_profiles?: { full_name: string; phone: string; location: string | null; cv_url: string | null; user_id?: string } | null;
}

export async function applyToJob(params: {
  jobId: string;
  candidateId: string;
  coverMessage?: string;
}) {
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
  return (data || []) as unknown as Application[];
}

export async function getAllApplications(filters?: { status?: string }) {
  let q = supabase
    .from('applications')
    .select('*, jobs(title, location), candidate_profiles(full_name, phone, location, cv_url, user_id)')
    .order('applied_at', { ascending: false });

  if (filters?.status) q = q.eq('status', filters.status as never);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as Application[];
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: newStatus } as never)
    .eq('id', applicationId)
    .select('*, candidate_profiles(user_id)')
    .single();
  if (error) throw error;

  // Status history is also written by DB trigger; add notes row when provided
  if (notes) {
    await supabase.from('application_status_history').insert({
      application_id: applicationId,
      to_status: newStatus,
      notes,
    });
  }

  try {
    const userId = (data as any)?.candidate_profiles?.user_id;
    if (userId) {
      const labels: Record<string, string> = {
        under_review: 'Your application is under review',
        shortlisted: 'You have been shortlisted',
        interview: 'Interview update from CareerJob',
        selected: 'You have been selected',
        placed: 'Congratulations — you are placed',
        rejected: 'Application update from CareerJob',
      };
      await createNotification({
        userId,
        title: labels[newStatus] || 'Application update',
        body: `Status: ${newStatus.replace('_', ' ')}`,
        type: 'application',
        entityType: 'application',
        entityId: applicationId,
      });
    }
  } catch {
    // non-blocking
  }

  return data;
}

export const REJECT_REASONS = [
  { value: 'experience', label: 'Experience' },
  { value: 'skills', label: 'Skills' },
  { value: 'salary', label: 'Salary' },
  { value: 'interview', label: 'Interview' },
  { value: 'position_filled', label: 'Position filled' },
  { value: 'other', label: 'Other' },
] as const;

export async function rejectApplication(applicationId: string, reason: string, notes?: string) {
  const note = notes ? `${reason}: ${notes}` : reason;
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', applicationId)
    .select('*, candidate_profiles(user_id)')
    .single();
  if (error) throw error;

  await supabase.from('application_status_history').insert({
    application_id: applicationId,
    to_status: 'rejected',
    notes: note,
  });

  try {
    const userId = (data as any)?.candidate_profiles?.user_id;
    if (userId) {
      await createNotification({
        userId,
        title: 'Application update from CareerJob',
        body: 'Your application was not selected this time. You remain an active job seeker — we will match other roles.',
        type: 'application',
        entityType: 'application',
        entityId: applicationId,
      });
    }
  } catch {
    /* non-blocking */
  }
  return data;
}

