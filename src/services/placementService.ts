import { supabase } from '../lib/supabase';

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
  position_title?: string | null;
  salary_amount?: number | null;
  commission_rate?: number | null;
  commission_amount?: number | null;
  day30_date?: string | null;
  day30_status?: string | null;
  commission_status?: string | null;
  created_at: string;
  candidate_profiles?: { full_name: string; phone: string } | null;
  jobs?: { title: string; location: string } | null;
  organizations?: { name: string } | null;
}

export async function getAllPlacements() {
  const { data, error } = await supabase
    .from('placements')
    .select(
      '*, candidate_profiles(full_name, phone), jobs(title, location), organizations(name)'
    )
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
  positionTitle?: string;
  salaryAmount?: number;
  commissionRate?: number;
  notes?: string;
  staffId?: string;
}) {
  const rate = params.commissionRate ?? 30;
  const salary = params.salaryAmount;
  const commission =
    salary != null ? Math.round(salary * (rate / 100)) : null;
  let day30: string | null = null;
  if (params.joiningDate) {
    const d = new Date(params.joiningDate);
    d.setDate(d.getDate() + 30);
    day30 = d.toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from('placements')
    .insert({
      application_id: params.applicationId,
      candidate_id: params.candidateId,
      job_id: params.jobId,
      organization_id: params.organizationId || null,
      joining_date: params.joiningDate || null,
      placement_date: new Date().toISOString().slice(0, 10),
      status: 'hired',
      position_title: params.positionTitle || null,
      salary_amount: salary ?? null,
      commission_rate: rate,
      commission_amount: commission,
      day30_date: day30,
      day30_status: 'pending',
      commission_status: 'pending',
      notes: params.notes || null,
      staff_id: params.staffId || null,
    })
    .select()
    .single();
  if (error) throw error;

  // Mark application placed
  await supabase
    .from('applications')
    .update({ status: 'placed' })
    .eq('id', params.applicationId);

  // Candidate employed
  await supabase
    .from('candidate_profiles')
    .update({ seeker_status: 'employed' })
    .eq('id', params.candidateId);

  return data as Placement;
}

export async function markDay30Complete(placementId: string) {
  const { data, error } = await supabase
    .from('placements')
    .update({
      day30_status: 'completed',
      status: 'day30_completed',
    })
    .eq('id', placementId)
    .select()
    .single();
  if (error) throw error;
  return data as Placement;
}

export async function setCommissionStatus(
  placementId: string,
  status: 'pending' | 'invoiced' | 'paid' | 'waived'
) {
  const { data, error } = await supabase
    .from('placements')
    .update({ commission_status: status })
    .eq('id', placementId)
    .select()
    .single();
  if (error) throw error;
  return data as Placement;
}

export async function markCandidateAvailable(candidateId: string) {
  const { error } = await supabase
    .from('candidate_profiles')
    .update({ seeker_status: 'active' })
    .eq('id', candidateId);
  if (error) throw error;
}

/** Days employed / remaining until day 30 */
export function placementDayProgress(joiningDate: string | null | undefined, day30Date?: string | null) {
  if (!joiningDate) return { daysEmployed: 0, daysLeft: 30, pct: 0 };
  const start = new Date(joiningDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const daysEmployed = Math.max(
    0,
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
  const day30 = day30Date
    ? new Date(day30Date)
    : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(
    0,
    Math.ceil((day30.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const pct = Math.min(100, Math.round((daysEmployed / 30) * 100));
  return { daysEmployed, daysLeft, pct };
}
