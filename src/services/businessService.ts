import { supabase } from '../lib/supabase';

export async function submitHiringRequest(payload: {
  organization_id: string;
  position_title: string;
  number_required: number;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_required?: string;
  responsibilities?: string;
  additional_requirements?: string;
  contact_person?: string;
  contact_phone?: string;
  created_by?: string;
}) {
  const { data, error } = await supabase
    .from('business_requests')
    .insert({
      ...payload,
      status: 'submitted',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyBusinessRequests(organizationId: string) {
  const { data, error } = await supabase
    .from('business_requests')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllBusinessRequests() {
  const { data, error } = await supabase
    .from('business_requests')
    .select('*, organizations(name, phone, contact_person)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateRequestStatus(id: string, status: string, linkedJobId?: string) {
  const update: Record<string, unknown> = { status };
  if (linkedJobId) update.linked_job_id = linkedJobId;
  const { data, error } = await supabase
    .from('business_requests')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createJobFromRequest(request: any, createdBy: string) {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      title: request.position_title,
      location: request.location,
      salary_min: request.salary_min,
      salary_max: request.salary_max,
      salary_display:
        request.salary_min && request.salary_max
          ? `Rs. ${request.salary_min.toLocaleString()}–${request.salary_max.toLocaleString()}`
          : null,
      job_type: request.job_type || 'full-time',
      experience_required: request.experience_required,
      description: request.responsibilities || request.additional_requirements,
      requirements: request.additional_requirements,
      status: 'draft',
      approved_by_agency: false,
      organization_id: request.organization_id,
      created_by: createdBy,
      public_employer_label: 'Employer via CareerJob',
    })
    .select()
    .single();
  if (error) throw error;

  await updateRequestStatus(request.id, 'accepted', job.id);
  return job;
}

export async function publishJob(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'published',
      approved_by_agency: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
