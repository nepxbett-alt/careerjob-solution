import { supabase } from './supabase';

export type CareerJobAiTask =
  | 'cv_summary'
  | 'improve_cv'
  | 'improve_experience'
  | 'job_description'
  | 'job_requirements';

export interface CareerJobAiSuccess {
  ok: true;
  task: CareerJobAiTask;
  provider?: string;
  result: string;
}

export interface CareerJobAiFailure {
  ok: false;
  error: string;
  code?: number;
}

export type CareerJobAiResponse = CareerJobAiSuccess | CareerJobAiFailure;

/**
 * Call the existing Supabase Edge Function `careerjob-ai`.
 * Requires an authenticated session (JWT). Never calls Gemini/Groq from the browser.
 */
export async function generateCareerJobAI(params: {
  task: CareerJobAiTask;
  input: string;
}): Promise<CareerJobAiResponse> {
  const input = (params.input || '').trim();
  if (!input) {
    return { ok: false, error: 'Add some text first, then try AI assistance.' };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: 'Please sign in to use AI assistance.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('careerjob-ai', {
      body: {
        task: params.task,
        input,
      },
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('401') || msg.toLowerCase().includes('jwt') || msg.toLowerCase().includes('unauthorized')) {
        return { ok: false, error: 'Please sign in to use AI assistance.', code: 401 };
      }
      if (msg.includes('429')) {
        return { ok: false, error: 'Too many requests. Please wait a moment and try again.', code: 429 };
      }
      return {
        ok: false,
        error: 'AI assistance is temporarily unavailable. Your original content is safe.',
        code: 500,
      };
    }

    // Normalize common response shapes from the edge function
    const payload = data as Record<string, unknown> | null;
    if (!payload) {
      return { ok: false, error: 'AI assistance is temporarily unavailable. Your original content is safe.' };
    }

    if (payload.ok === false) {
      return {
        ok: false,
        error:
          typeof payload.error === 'string'
            ? payload.error
            : 'AI assistance is temporarily unavailable. Your original content is safe.',
      };
    }

    const result =
      (typeof payload.result === 'string' && payload.result) ||
      (typeof payload.text === 'string' && payload.text) ||
      (typeof payload.content === 'string' && payload.content) ||
      (typeof payload.output === 'string' && payload.output) ||
      '';

    if (!result.trim()) {
      return { ok: false, error: 'AI returned an empty response. Please try again.' };
    }

    return {
      ok: true,
      task: params.task,
      provider: typeof payload.provider === 'string' ? payload.provider : undefined,
      result: result.trim(),
    };
  } catch {
    return {
      ok: false,
      error: 'AI assistance is temporarily unavailable. Your original content is safe.',
    };
  }
}
