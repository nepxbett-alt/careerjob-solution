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
  payload: PublicApplicationPayload,
): Promise<PublicApplicationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('public-job-application', {
      body: payload,
    });

    // Prefer structured body from the function when present
    if (data && typeof data === 'object') {
      const result = data as PublicApplicationResult;
      if (typeof result.success === 'boolean') {
        return result;
      }
    }

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('rate')) {
        return {
          success: false,
          error: 'You have already applied recently. CareerJob will contact you if needed.',
        };
      }
      if (msg.includes('failed to send') || msg.includes('fetch') || msg.includes('network')) {
        return {
          success: false,
          error: 'Network error. Check your connection or message CareerJob on WhatsApp.',
        };
      }
      // Edge Function not deployed / JWT / gateway errors
      if (msg.includes('not found') || msg.includes('404') || msg.includes('relaying')) {
        return {
          success: false,
          error:
            'Application service is temporarily unavailable. Please contact CareerJob on WhatsApp.',
        };
      }
      return {
        success: false,
        error: 'Could not submit application. Please try again or contact CareerJob on WhatsApp.',
      };
    }

    return { success: false, error: 'Empty response from server.' };
  } catch {
    return {
      success: false,
      error: 'Could not submit application. Please try again or contact CareerJob on WhatsApp.',
    };
  }
}
