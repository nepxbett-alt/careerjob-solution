/**
 * Public (anonymous) job application — goes through Edge Function only.
 * Never inserts directly into candidate_profiles / applications from the browser.
 */
import { supabase } from '../lib/supabase';

export interface PublicApplicationPayload {
  job_id: string;
  full_name: string;
  phone: string;
  email?: string;
  location?: string;
  education?: string;
  experience?: string;
  message?: string;
}

export interface PublicApplicationResult {
  success: boolean;
  application_reference?: string;
  message?: string;
  error?: string;
}

export async function submitPublicApplication(
  payload: PublicApplicationPayload
): Promise<PublicApplicationResult> {
  const { data, error } = await supabase.functions.invoke('public-job-application', {
    body: payload,
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('429') || msg.toLowerCase().includes('rate')) {
      return {
        success: false,
        error: 'You have already applied recently. CareerJob will contact you if needed.',
      };
    }
    return {
      success: false,
      error: 'Could not submit application. Please try again or contact CareerJob on WhatsApp.',
    };
  }

  const result = data as PublicApplicationResult | null;
  if (!result) {
    return { success: false, error: 'Empty response from server.' };
  }
  return result;
}
