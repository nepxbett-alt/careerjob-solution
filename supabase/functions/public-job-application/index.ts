/**
 * CareerJob — Public Job Application Edge Function
 *
 * Anonymous visitors submit applications here.
 * Uses service role server-side only.
 * Never returns internal IDs or private data.
 *
 * Deploy: supabase functions deploy public-job-application --no-verify-jwt
 * Secrets: SUPABASE_SERVICE_ROLE_KEY (auto), optional GEMINI not needed.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('+977')) p = p.slice(4);
  if (p.startsWith('977') && p.length > 10) p = p.slice(3);
  if (p.startsWith('0')) p = p.slice(1);
  return p;
}

function isValidNepalPhone(p: string): boolean {
  return /^9[78]\d{8}$/.test(p);
}

function makeReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CJ-${year}-${rand}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!supabaseUrl || !serviceKey) {
      return json({ success: false, error: 'Server configuration error' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return json({ success: false, error: 'Invalid request body' }, 400);
    }

    const jobId = String(body.job_id || '').trim();
    const fullName = String(body.full_name || '').trim();
    const phoneRaw = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const location = body.location ? String(body.location).trim() : 'Pokhara';
    const education = body.education ? String(body.education).trim() : null;
    const experience = body.experience ? String(body.experience).trim() : null;
    const message = body.message ? String(body.message).trim().slice(0, 2000) : null;

    if (!jobId || !fullName || fullName.length < 2) {
      return json({ success: false, error: 'Full name and job are required.' }, 400);
    }
    if (fullName.length > 120) {
      return json({ success: false, error: 'Name is too long.' }, 400);
    }

    const phone = normalizePhone(phoneRaw);
    if (!isValidNepalPhone(phone)) {
      return json(
        { success: false, error: 'Please enter a valid Nepal mobile number (e.g. 98XXXXXXXX).' },
        400
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, error: 'Please enter a valid email address.' }, 400);
    }

    // Validate job is public & open
    const { data: job, error: jobErr } = await admin
      .from('jobs')
      .select('id, title, status, approved_by_agency, application_deadline')
      .eq('id', jobId)
      .maybeSingle();

    if (jobErr || !job) {
      return json({ success: false, error: 'Job not found.' }, 404);
    }
    if (job.status !== 'published' || !job.approved_by_agency) {
      return json({ success: false, error: 'This job is not open for applications.' }, 400);
    }
    if (job.application_deadline) {
      const dl = new Date(job.application_deadline);
      if (!Number.isNaN(dl.getTime()) && dl < new Date()) {
        return json({ success: false, error: 'The application deadline for this job has passed.' }, 400);
      }
    }

    // Rate limit: same phone + job within 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentApps } = await admin
      .from('applications')
      .select('id, candidate_profiles!inner(phone)')
      .eq('job_id', jobId)
      .gte('applied_at', since)
      .limit(5);

    const phoneHit = (recentApps || []).some(
      (a: any) => normalizePhone(a.candidate_profiles?.phone || '') === phone
    );
    if (phoneHit) {
      return json({
        success: false,
        error: 'You have already applied to this job recently. CareerJob will contact you if needed.',
      }, 429);
    }

    // Find existing candidate by phone (safe association)
    let candidateId: string | null = null;
    const { data: existingByPhone } = await admin
      .from('candidate_profiles')
      .select('id, full_name, phone')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingByPhone) {
      candidateId = existingByPhone.id;
    } else if (email) {
      const { data: existingByEmail } = await admin
        .from('candidate_profiles')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();
      if (existingByEmail) candidateId = existingByEmail.id;
    }

    if (!candidateId) {
      // Create new candidate (anonymous — no user_id)
      const { data: created, error: createErr } = await admin
        .from('candidate_profiles')
        .insert({
          user_id: null,
          full_name: fullName,
          phone,
          email,
          location,
          education,
          experience_notes: experience,
          headline: null,
          registration_source: 'public_application',
          seeker_status: 'active',
          profile_completion: fullName && phone ? 50 : 25,
          is_verified: false,
        })
        .select('id')
        .single();

      if (createErr || !created) {
        console.error('candidate create error', createErr);
        return json({ success: false, error: 'Could not save your application. Please try again or contact CareerJob.' }, 500);
      }
      candidateId = created.id;
    } else {
      // Light update of optional fields if empty
      await admin
        .from('candidate_profiles')
        .update({
          ...(email ? { email } : {}),
          ...(location ? { location } : {}),
          ...(education ? { education } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);
    }

    // Prevent duplicate application for same job+candidate
    const { data: existingApp } = await admin
      .from('applications')
      .select('id, application_reference')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existingApp) {
      return json({
        success: true,
        application_reference: existingApp.application_reference || 'CJ-EXISTING',
        message: 'You have already applied to this job. CareerJob has your details.',
      });
    }

    const reference = makeReference();

    const { data: app, error: appErr } = await admin
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        status: 'applied',
        cover_message: message,
        application_reference: reference,
        application_source: 'public_application',
      })
      .select('id')
      .single();

    if (appErr || !app) {
      console.error('application create error', appErr);
      return json({ success: false, error: 'Could not create application. Please try again.' }, 500);
    }

    // History
    await admin.from('application_status_history').insert({
      application_id: app.id,
      from_status: null,
      to_status: 'applied',
      note: 'Public application submitted (no login)',
      changed_by: null,
    }).catch(() => {});

    // Notify staff (best-effort)
    try {
      const { data: staff } = await admin
        .from('profiles')
        .select('id')
        .in('role', ['owner', 'admin', 'recruiter', 'staff'])
        .limit(20);

      if (staff?.length) {
        const rows = staff.map((s) => ({
          user_id: s.id,
          title: 'New public application',
          body: `${fullName} applied for ${job.title}. Ref: ${reference}`,
          type: 'application',
          entity_type: 'application',
          entity_id: app.id,
          is_read: false,
        }));
        await admin.from('notifications').insert(rows);
      }
    } catch {
      // non-fatal
    }

    return json({
      success: true,
      application_reference: reference,
      message: 'Your application has been received. CareerJob will review it and contact you if appropriate.',
    });
  } catch (e) {
    console.error('public-job-application error', e);
    return json({ success: false, error: 'Something went wrong. Please try again later.' }, 500);
  }
});
