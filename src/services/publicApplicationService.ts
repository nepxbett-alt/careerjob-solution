/**
 * Public (anonymous) job application.
 * Prefer Vercel /api/public-apply (service role server-side), then Edge Function.
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

async function postJson(url: string, payload: PublicApplicationPayload): Promise<PublicApplicationResult | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as PublicApplicationResult | null;
    if (data && typeof data.success === 'boolean') return data;
    if (!res.ok) {
      return {
        success: false,
        error: 'Could not submit application. Please try again or contact CareerJob on WhatsApp.',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function submitPublicApplication(
  payload: PublicApplicationPayload,
): Promise<PublicApplicationResult> {
  // 1) Vercel serverless (production) — requires SUPABASE_SERVICE_ROLE_KEY on Vercel
  const apiResult = await postJson('/api/public-apply', payload);
  if (apiResult && apiResult.success) return apiResult;
  if (apiResult && apiResult.error && !apiResult.error.includes('not configured')) {
    // Real validation / business error from API
    if (
      apiResult.error.includes('required') ||
      apiResult.error.includes('valid') ||
      apiResult.error.includes('deadline') ||
      apiResult.error.includes('not open') ||
      apiResult.error.includes('not found') ||
      apiResult.error.includes('already applied')
    ) {
      return apiResult;
    }
  }
  if (apiResult?.success === false && apiResult.error && !apiResult.error.includes('not configured')) {
    // Prefer API error if it looks intentional
    if (apiResult.error.length < 120) return apiResult;
  }

  // 2) Supabase Edge Function fallback
  try {
    const { data, error } = await supabase.functions.invoke('public-job-application', {
      body: payload,
    });

    if (data && typeof data === 'object') {
      const result = data as PublicApplicationResult;
      if (typeof result.success === 'boolean') return result;
    }

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('rate')) {
        return {
          success: false,
          error: 'You have already applied recently. CareerJob will contact you if needed.',
        };
      }
    }
  } catch {
    /* fall through */
  }

  // If API returned a config error, surface WhatsApp guidance
  if (apiResult?.error) return apiResult;

  return {
    success: false,
    error: 'Could not submit application. Please try again or contact CareerJob on WhatsApp.',
  };
}
