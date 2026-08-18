import { supabase } from '../lib/supabase';
import { createNotification } from './notificationService';

export interface Interview {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  organization_id: string | null;
  scheduled_at: string;
  location: string | null;
  instructions: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  jobs?: { title: string; location: string } | null;
  candidate_profiles?: { full_name: string; phone: string; user_id?: string } | null;
}

export async function getAllInterviews() {
  const { data, error } = await supabase
    .from('interviews')
    .select('*, jobs(title, location), candidate_profiles(full_name, phone, user_id)')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return (data || []) as Interview[];
}

export async function scheduleInterview(params: {
  applicationId: string;
  candidateId: string;
  jobId: string;
  organizationId?: string;
  scheduledAt: string;
  location?: string;
  instructions?: string;
  notes?: string;
  createdBy?: string;
}) {
  const { data, error } = await supabase
    .from('interviews')
    .insert({
      application_id: params.applicationId,
      candidate_id: params.candidateId,
      job_id: params.jobId,
      organization_id: params.organizationId || null,
      scheduled_at: params.scheduledAt,
      location: params.location || null,
      instructions: params.instructions || null,
      notes: params.notes || null,
      status: 'scheduled',
      created_by: params.createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;

  // move application to interview status
  await supabase
    .from('applications')
    .update({ status: 'interview' })
    .eq('id', params.applicationId);

  try {
    const { data: cp } = await supabase
      .from('candidate_profiles')
      .select('user_id')
      .eq('id', params.candidateId)
      .single();
    if (cp?.user_id) {
      await createNotification({
        userId: cp.user_id,
        title: 'Interview scheduled',
        body: params.location
          ? `Interview on ${new Date(params.scheduledAt).toLocaleString()} at ${params.location}`
          : `Interview on ${new Date(params.scheduledAt).toLocaleString()}`,
        type: 'interview',
        entityType: 'interview',
        entityId: data.id,
      });
    }
  } catch {
    // non-blocking
  }

  return data;
}

export async function updateInterviewStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('interviews')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
