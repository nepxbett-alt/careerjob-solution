/**
 * CareerJob — Public Job Application Edge Function
 *
 * Anonymous visitors submit applications here.
 * Uses service role server-side only.
 * Never returns internal IDs or private data.
 *
 * Deploy: supabase functions deploy public-job-application --no-verify-jwt
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
  let p = String(raw || '').replace(/[\s\-()]/g, '');
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('missing env', { hasUrl: !!supabaseUrl, hasKey: !!serviceKey });
      return json({ success: false, error: 'Server configuration error' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return json({ success: false, error: 'Invalid request body' }, 400);
    }

    const b = body as Record<string, unknown>;
    const jobId = String(b.job_id || '').trim();
    const fullName = String(b.full_name || '').trim();
    const phoneRaw = String(b.phone || '').trim();
    const email = b.email ? String(b.email).trim().toLowerCase() : null;
    const location = b.location ? String(b.location).trim() : 'Pokhara';
    const education = b.education ? String(b.education).trim() : null;
    const experience = b.experience ? String(b.experience).trim() : null;
    const message = b.message ? String(b.message).trim().slice(0, 2000) : null;

    if (!jobId) {
      return json({ success: false, error: 'Job is required.' }, 400);
    }
    if (!fullName || fullName.length < 2) {
      return json({ success: false, error: 'Full name is required.' }, 400);
    }
    if (fullName.length > 120) {
      return json({ success: false, error: 'Name is too long.' }, 400);
    }

    const phone = normalizePhone(phoneRaw);
    if (!isValidNepalPhone(phone)) {
      return json(
        { success: false, error: 'Please enter a valid Nepal mobile number (e.g. 98XXXXXXXX).' },
        400,
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, error: 'Please enter a valid email address.' }, 400);
    }

    const { data: job, error: jobErr } = await admin
      .from('jobs')
      .select('id, title, status, approved_by_agency, application_deadline')
      .eq('id', jobId)
      .maybeSingle();

    if (jobErr) {
      console.error('job lookup error', jobErr);
      return json({ success: false, error: 'Could not verify job. Please try again.' }, 500);
    }
    if (!job) {
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

    let candidateId: string | null = null;
    const { data: byPhoneRows, error: phoneErr } = await admin
      .from('candidate_profiles')
      .select('id, phone')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    if (phoneErr) {
      console.error('phone lookup error', phoneErr);
      return json({ success: false, error: 'Could not process application. Please try again.' }, 500);
    }

    if (byPhoneRows && byPhoneRows.length > 0) {
      candidateId = byPhoneRows[0].id;
    } else if (email) {
      const { data: byEmailRows } = await admin
        .from('candidate_profiles')
        .select('id')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
      if (byEmailRows && byEmailRows.length > 0) {
        candidateId = byEmailRows[0].id;
      }
    }

    if (candidateId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recent } = await admin
        .from('applications')
        .select('id, application_reference')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .gte('applied_at', since)
        .limit(1);

      if (recent && recent.length > 0) {
        return json({
          success: true,
          application_reference: recent[0].application_reference || 'CJ-EXISTING',
          message: 'You have already applied to this job recently. CareerJob will contact you if needed.',
        });
      }
    }

    if (!candidateId) {
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
        return json(
          { success: false, error: 'Could not save your application. Please try again or contact CareerJob.' },
          500,
        );
      }
      candidateId = created.id;
    } else {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (email) patch.email = email;
      if (location) patch.location = location;
      if (education) patch.education = education;
      if (experience) patch.experience_notes = experience;
      if (fullName) patch.full_name = fullName;
      await admin.from('candidate_profiles').update(patch).eq('id', candidateId);
    }

    const { data: existingAppRows } = await admin
      .from('applications')
      .select('id, application_reference')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .limit(1);

    if (existingAppRows && existingAppRows.length > 0) {
      return json({
        success: true,
        application_reference: existingAppRows[0].application_reference || 'CJ-EXISTING',
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

    try {
      await admin.from('application_status_history').insert({
        application_id: app.id,
        from_status: null,
        to_status: 'applied',
        notes: 'Public application submitted (no login)',
        changed_by: null,
      });
    } catch (histErr) {
      console.error('history insert non-fatal', histErr);
    }

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
    } catch (nErr) {
      console.error('notify non-fatal', nErr);
    }

    return json({
      success: true,
      application_reference: reference,
      message:
        'Your application has been received. CareerJob will review it and contact you if appropriate.',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('public-job-application error', msg, e);
    return json({ success: false, error: 'Something went wrong. Please try again later.' }, 500);
  }
});
