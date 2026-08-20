import { supabase } from '../lib/supabase';

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  location: string | null;
  headline: string | null;
  bio: string | null;
  experience_years: number | null;
  education: string | null;
  skills: string[] | null;
  languages: string[] | null;
  photo_url: string | null;
  cv_url: string | null;
  profile_completion: number;
  is_verified: boolean;
  experience_notes?: string | null;
  desired_position?: string | null;
}

export async function getMyCandidateProfile(userId: string) {
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as CandidateProfile | null;
}

export async function upsertCandidateProfile(
  userId: string,
  payload: Partial<CandidateProfile> & { full_name: string; phone: string }
) {
  const existing = await getMyCandidateProfile(userId);
  const completion = calcCompletion(payload);

  if (existing) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .update({ ...payload, profile_completion: completion })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as CandidateProfile;
  }

  const { data, error } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: userId,
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email ?? null,
      location: payload.location ?? null,
      headline: payload.headline ?? null,
      bio: payload.bio ?? null,
      skills: payload.skills ?? [],
      languages: payload.languages ?? [],
      profile_completion: completion,
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CandidateProfile;
}

function calcCompletion(p: Partial<CandidateProfile>): number {
  let score = 0;
  if (p.full_name) score += 25;
  if (p.phone) score += 25;
  if (p.location) score += 15;
  if (p.cv_url) score += 20;
  if (p.skills && p.skills.length) score += 10;
  if (p.education) score += 5;
  return Math.min(100, score);
}

export async function uploadCV(userId: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  if (!allowed.includes(ext)) throw new Error('Only PDF, DOC, DOCX, JPG, PNG allowed');
  if (file.size > 5 * 1024 * 1024) throw new Error('File must be under 5 MB');

  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('candidate-documents')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  // store path (private bucket – use signed URL later)
  const profile = await getMyCandidateProfile(userId);
  if (profile) {
    await supabase
      .from('candidate_profiles')
      .update({ cv_url: path, profile_completion: calcCompletion({ ...profile, cv_url: path }) })
      .eq('user_id', userId);
  }

  // also insert document record if profile exists
  if (profile) {
    await supabase.from('candidate_documents').insert({
      candidate_id: profile.id,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      document_type: 'cv',
      is_primary: true,
    });
  }

  return path;
}

export async function getSignedCVUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('candidate-documents')
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export type SeekerStatus = 'active' | 'passive' | 'employed' | 'inactive';

export async function createWalkInCandidate(params: {
  full_name: string;
  phone: string;
  email?: string;
  location?: string;
  education?: string;
  experience_years?: number;
  skills?: string[];
  desired_position?: string;
  expected_salary?: number;
  availability?: string;
  registeredBy?: string;
  notes?: string;
}) {
  const completion = calcCompletion({
    full_name: params.full_name,
    phone: params.phone,
    location: params.location,
    education: params.education,
    skills: params.skills,
  });

  const { data, error } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: null,
      full_name: params.full_name.trim(),
      phone: params.phone.trim(),
      email: params.email?.trim() || null,
      location: params.location || 'Pokhara',
      education: params.education || null,
      experience_years: params.experience_years ?? null,
      skills: params.skills || [],
      desired_position: params.desired_position || null,
      expected_salary: params.expected_salary ?? null,
      availability: params.availability || null,
      headline: params.desired_position || null,
      seeker_status: 'active',
      registration_source: 'walk_in',
      registered_by: params.registeredBy || null,
      profile_completion: completion,
      is_verified: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CandidateProfile;
}

export async function setSeekerStatus(candidateId: string, status: SeekerStatus) {
  const { data, error } = await supabase
    .from('candidate_profiles')
    .update({ seeker_status: status })
    .eq('id', candidateId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Persist structured CV fields onto candidate_profiles */
export async function saveCandidateCvFields(
  candidateId: string,
  data: {
    full_name: string;
    phone: string;
    email?: string | null;
    location?: string | null;
    headline?: string | null;
    bio?: string | null;
    education?: string | null;
    skills?: string[];
    languages?: string[] | null;
    desired_position?: string | null;
    experience_notes?: string | null;
  }
) {
  const payload = {
    full_name: data.full_name,
    phone: data.phone,
    email: data.email ?? null,
    location: data.location ?? null,
    headline: data.headline ?? null,
    bio: data.bio ?? null,
    education: data.education ?? null,
    skills: data.skills ?? [],
    languages: data.languages ?? [],
    desired_position: data.desired_position ?? null,
    experience_notes: data.experience_notes ?? null,
    profile_completion: calcCompletion({
      full_name: data.full_name,
      phone: data.phone,
      location: data.location ?? undefined,
      skills: data.skills,
      education: data.education ?? undefined,
      cv_url: data.bio || data.experience_notes ? 'built' : null,
    }),
  };

  const { data: row, error } = await supabase
    .from('candidate_profiles')
    .update(payload)
    .eq('id', candidateId)
    .select()
    .single();
  if (error) throw error;
  return row as unknown as CandidateProfile;
}

/** Admin / staff upload CV file for any candidate (including walk-ins) */
export async function uploadCandidateFile(candidateId: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  if (!allowed.includes(ext)) throw new Error('Only PDF, DOC, DOCX, JPG, PNG allowed');
  if (file.size > 5 * 1024 * 1024) throw new Error('File must be under 5 MB');

  const path = `candidates/${candidateId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('candidate-documents')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  await supabase
    .from('candidate_profiles')
    .update({ cv_url: path })
    .eq('id', candidateId);

  await supabase.from('candidate_documents').insert({
    candidate_id: candidateId,
    file_name: file.name,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
    document_type: 'cv',
    is_primary: true,
  });

  return path;
}
