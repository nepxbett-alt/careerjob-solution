import { supabase } from '../lib/supabase';

export type CandidateOpsStatus =
  | 'new_request'
  | 'contacted'
  | 'looking_for_job'
  | 'matched'
  | 'sent_to_workplace'
  | 'trial'
  | 'placed'
  | 'active_job_seeker'
  | 'inactive';

export type BusinessOpsStatus =
  | 'new_request'
  | 'contacted'
  | 'requirement_confirmed'
  | 'candidates_matching'
  | 'candidate_sent'
  | 'hiring_confirmed'
  | 'closed';

export async function logActivity(params: {
  entityType: string;
  entityId: string;
  action: string;
  notes?: string;
  actorId?: string;
}) {
  await supabase.from('activity_log').insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    notes: params.notes || null,
    actor_id: params.actorId || null,
  });
}

export async function getActivity(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function markCandidateContacted(candidateId: string, notes?: string, actorId?: string) {
  const { error } = await supabase
    .from('candidate_profiles')
    .update({
      ops_status: 'contacted',
      last_contacted_at: new Date().toISOString(),
      next_action: notes || 'Find suitable job',
      seeker_status: 'active',
    })
    .eq('id', candidateId);
  if (error) throw error;
  await logActivity({
    entityType: 'candidate',
    entityId: candidateId,
    action: 'contacted',
    notes,
    actorId,
  });
}

export async function setCandidateOpsStatus(
  candidateId: string,
  status: CandidateOpsStatus,
  notes?: string,
  actorId?: string
) {
  const patch: Record<string, unknown> = { ops_status: status };
  if (status === 'active_job_seeker' || status === 'looking_for_job') {
    patch.seeker_status = 'active';
  }
  if (status === 'placed') patch.seeker_status = 'employed';
  if (status === 'trial' || status === 'sent_to_workplace') patch.seeker_status = 'employed';

  const { error } = await supabase.from('candidate_profiles').update(patch).eq('id', candidateId);
  if (error) throw error;
  await logActivity({
    entityType: 'candidate',
    entityId: candidateId,
    action: `status:${status}`,
    notes,
    actorId,
  });
}

export async function sendToWorkplace(params: {
  candidateId: string;
  workplaceName: string;
  positionTitle: string;
  salaryAmount?: number;
  organizationId?: string;
  businessRequestId?: string;
  jobId?: string;
  notes?: string;
  createdBy?: string;
}) {
  const sentAt = new Date();
  const followUp = new Date(sentAt);
  followUp.setDate(followUp.getDate() + 1);
  const followUpDate = followUp.toISOString().slice(0, 10);
  const sentDate = sentAt.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('workplace_assignments')
    .insert({
      candidate_id: params.candidateId,
      workplace_name: params.workplaceName,
      position_title: params.positionTitle,
      salary_amount: params.salaryAmount ?? null,
      organization_id: params.organizationId || null,
      business_request_id: params.businessRequestId || null,
      job_id: params.jobId || null,
      sent_at: sentDate,
      follow_up_date: followUpDate,
      follow_up_done: false,
      workplace_result: 'pending',
      status: 'sent',
      notes: params.notes || null,
      created_by: params.createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from('candidate_profiles')
    .update({
      ops_status: 'sent_to_workplace',
      seeker_status: 'employed',
      next_action: `Follow up ${followUpDate}`,
    })
    .eq('id', params.candidateId);

  await supabase.from('admin_reminders').insert({
    title: `Follow up — ${params.workplaceName}`,
    body: `Candidate sent ${sentDate}. Confirm workplace status.`,
    due_date: followUpDate,
    reminder_type: 'follow_up',
    candidate_id: params.candidateId,
    workplace_assignment_id: data.id,
    business_request_id: params.businessRequestId || null,
    created_by: params.createdBy || null,
  });

  await logActivity({
    entityType: 'candidate',
    entityId: params.candidateId,
    action: 'sent_to_workplace',
    notes: `${params.positionTitle} @ ${params.workplaceName}`,
    actorId: params.createdBy,
  });

  return data;
}

export async function confirmWorkplaceStatus(
  assignmentId: string,
  result: 'placed' | 'trial',
  opts?: { trialDays?: number; notes?: string; actorId?: string }
) {
  const { data: wa, error: fetchErr } = await supabase
    .from('workplace_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();
  if (fetchErr) throw fetchErr;

  if (result === 'placed') {
    const { error } = await supabase
      .from('workplace_assignments')
      .update({
        workplace_result: 'placed',
        status: 'placed',
        follow_up_done: true,
        notes: opts?.notes || wa.notes,
      })
      .eq('id', assignmentId);
    if (error) throw error;

    await supabase
      .from('candidate_profiles')
      .update({ ops_status: 'placed', seeker_status: 'employed', next_action: null })
      .eq('id', wa.candidate_id);

    await supabase
      .from('admin_reminders')
      .update({ is_done: true })
      .eq('workplace_assignment_id', assignmentId)
      .eq('is_done', false);

    await logActivity({
      entityType: 'candidate',
      entityId: wa.candidate_id,
      action: 'placed',
      notes: opts?.notes,
      actorId: opts?.actorId,
    });
    return;
  }

  // trial
  const days = opts?.trialDays && opts.trialDays > 0 ? opts.trialDays : 7;
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const trialStart = start.toISOString().slice(0, 10);
  const trialEnd = end.toISOString().slice(0, 10);

  const { error } = await supabase
    .from('workplace_assignments')
    .update({
      workplace_result: 'trial',
      status: 'trial',
      follow_up_done: true,
      trial_start: trialStart,
      trial_days: days,
      trial_end: trialEnd,
      notes: opts?.notes || wa.notes,
    })
    .eq('id', assignmentId);
  if (error) throw error;

  await supabase
    .from('candidate_profiles')
    .update({
      ops_status: 'trial',
      seeker_status: 'employed',
      next_action: `Trial ends ${trialEnd}`,
    })
    .eq('id', wa.candidate_id);

  await supabase
    .from('admin_reminders')
    .update({ is_done: true })
    .eq('workplace_assignment_id', assignmentId)
    .eq('reminder_type', 'follow_up')
    .eq('is_done', false);

  await supabase.from('admin_reminders').insert({
    title: `Trial ending — ${wa.workplace_name}`,
    body: `${wa.position_title}. Trial ${days} days (${trialStart} → ${trialEnd}).`,
    due_date: trialEnd,
    reminder_type: 'trial_end',
    candidate_id: wa.candidate_id,
    workplace_assignment_id: assignmentId,
    created_by: opts?.actorId || null,
  });

  await logActivity({
    entityType: 'candidate',
    entityId: wa.candidate_id,
    action: 'trial_started',
    notes: `${days} days, ends ${trialEnd}`,
    actorId: opts?.actorId,
  });
}

export async function completeTrial(
  assignmentId: string,
  result: 'placed' | 'not_selected',
  opts?: { notes?: string; actorId?: string }
) {
  const { data: wa, error: fetchErr } = await supabase
    .from('workplace_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();
  if (fetchErr) throw fetchErr;

  if (result === 'placed') {
    await supabase
      .from('workplace_assignments')
      .update({ trial_result: 'placed', status: 'placed' })
      .eq('id', assignmentId);
    await supabase
      .from('candidate_profiles')
      .update({ ops_status: 'placed', seeker_status: 'employed', next_action: null })
      .eq('id', wa.candidate_id);
    await logActivity({
      entityType: 'candidate',
      entityId: wa.candidate_id,
      action: 'trial_placed',
      notes: opts?.notes,
      actorId: opts?.actorId,
    });
  } else {
    await supabase
      .from('workplace_assignments')
      .update({ trial_result: 'not_selected', status: 'returned' })
      .eq('id', assignmentId);
    await supabase
      .from('candidate_profiles')
      .update({
        ops_status: 'active_job_seeker',
        seeker_status: 'active',
        next_action: 'Match another job',
      })
      .eq('id', wa.candidate_id);
    await logActivity({
      entityType: 'candidate',
      entityId: wa.candidate_id,
      action: 'trial_not_selected',
      notes: opts?.notes || 'Returned to active job seeker',
      actorId: opts?.actorId,
    });
  }

  await supabase
    .from('admin_reminders')
    .update({ is_done: true })
    .eq('workplace_assignment_id', assignmentId)
    .eq('is_done', false);
}

export async function getDueReminders() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('admin_reminders')
    .select('*, candidate_profiles(full_name, phone)')
    .eq('is_done', false)
    .lte('due_date', today)
    .order('due_date', { ascending: true })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function getUpcomingReminders() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('admin_reminders')
    .select('*, candidate_profiles(full_name, phone)')
    .eq('is_done', false)
    .gt('due_date', today)
    .order('due_date', { ascending: true })
    .limit(20);
  if (error) throw error;
  return data || [];
}

export async function completeReminder(id: string) {
  await supabase.from('admin_reminders').update({ is_done: true }).eq('id', id);
}

export async function markBusinessContacted(requestId: string, notes?: string, actorId?: string) {
  const { error } = await supabase
    .from('business_requests')
    .update({
      ops_status: 'contacted',
      last_contacted_at: new Date().toISOString(),
      next_action: notes || 'Confirm requirements',
    })
    .eq('id', requestId);
  if (error) throw error;
  await logActivity({
    entityType: 'business_request',
    entityId: requestId,
    action: 'contacted',
    notes,
    actorId,
  });
}

export async function setBusinessOpsStatus(requestId: string, status: BusinessOpsStatus, notes?: string) {
  const { error } = await supabase
    .from('business_requests')
    .update({ ops_status: status, next_action: notes || null })
    .eq('id', requestId);
  if (error) throw error;
}

/** Public hire-staff form → business_requests row for admin queue */
export async function submitPublicHireRequest(params: {
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  location: string;
  positionTitle: string;
  numberRequired: number;
  salaryMin?: number;
  salaryMax?: number;
  workingHours?: string;
  accommodation?: boolean;
  meals?: boolean;
  experience?: string;
  skills?: string;
  urgency?: string;
  additional?: string;
}) {
  const { data, error } = await supabase
    .from('business_requests')
    .insert({
      business_name: params.businessName,
      contact_person: params.contactPerson,
      contact_phone: params.phone,
      location: params.location,
      position_title: params.positionTitle,
      number_required: params.numberRequired,
      salary_min: params.salaryMin ?? null,
      salary_max: params.salaryMax ?? null,
      working_hours: params.workingHours || null,
      accommodation: params.accommodation ?? null,
      meals: params.meals ?? null,
      urgency: params.urgency || null,
      additional_requirements: [
        params.experience && `Experience: ${params.experience}`,
        params.skills && `Skills: ${params.skills}`,
        params.additional,
      ]
        .filter(Boolean)
        .join('\n'),
      status: 'submitted',
      ops_status: 'new_request',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Public find-a-job form → walk-in style candidate without auth */
export async function submitPublicJobSeekerRequest(params: {
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  desiredPosition?: string;
  experienceYears?: number;
  skills?: string[];
  expectedSalary?: number;
  availability?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: null,
      full_name: params.fullName.trim(),
      phone: params.phone.trim(),
      email: params.email?.trim() || null,
      location: params.location || 'Pokhara',
      desired_position: params.desiredPosition || null,
      experience_years: params.experienceYears ?? null,
      skills: params.skills || [],
      expected_salary: params.expectedSalary ?? null,
      availability: params.availability || null,
      headline: params.desiredPosition || null,
      bio: params.notes || null,
      seeker_status: 'active',
      ops_status: 'new_request',
      registration_source: 'online',
      profile_completion: 40,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
