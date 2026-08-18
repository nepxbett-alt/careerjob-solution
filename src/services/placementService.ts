import { supabase } from '../lib/supabase';
import { createNotification } from './notificationService';

export interface Placement {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  organization_id: string | null;
  placement_date: string;
  joining_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  jobs?: { title: string; location: string } | null;
  candidate_profiles?: { full_name: string; phone: string } | null;
}

export async function getAllPlacements() {
  const { data, error } = await supabase
    .from('placements')
    .select('*, jobs(title, location), candidate_profiles(full_name, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Placement[];
}

export async function createPlacement(params: {
  applicationId: string;
  candidateId: string;
  jobId: string;
  organizationId?: string;
  joiningDate?: string;
  notes?: string;
  staffId?: string;
}) {
  const { data, error } = await supabase
    .from('placements')
    .insert({
      application_id: params.applicationId,
      candidate_id: params.candidateId,
      job_id: params.jobId,
      organization_id: params.organizationId || null,
      placement_date: new Date().toISOString().slice(0, 10),
      joining_date: params.joiningDate || null,
      status: 'placed',
      notes: params.notes || null,
      staff_id: params.staffId || null,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from('applications')
    .update({ status: 'placed' })
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
        title: 'You have been placed',
        body: 'Congratulations! CareerJob has recorded your placement.',
        type: 'placement',
        entityType: 'placement',
        entityId: data.id,
      });
    }
  } catch {
    // non-blocking
  }

  return data;
}
