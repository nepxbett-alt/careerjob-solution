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
