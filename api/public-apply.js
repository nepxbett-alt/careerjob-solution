/**
 * Vercel Serverless — CareerJob public job application
 * Env (Vercel project settings — not VITE_):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require('@supabase/supabase-js');

function normalizePhone(raw) {
  let p = String(raw || '').replace(/[\s\-()]/g, '');
  if (p.startsWith('+977')) p = p.slice(4);
  if (p.startsWith('977') && p.length > 10) p = p.slice(3);
  if (p.startsWith('0')) p = p.slice(1);
  return p;
}

function isValidNepalPhone(p) {
  return /^9[78]\d{8}$/.test(p);
}

function makeReference() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CJ-${year}-${rand}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, apikey, x-client-info');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({
      success: false,
      error: 'Application service is not configured. Please contact CareerJob on WhatsApp.',
    });
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const jobId = String(body.job_id || '').trim();
    const fullName = String(body.full_name || '').trim();
    const phoneRaw = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const location = body.location ? String(body.location).trim() : 'Pokhara';
    const education = body.education ? String(body.education).trim() : null;
    const experience = body.experience ? String(body.experience).trim() : null;
    const message = body.message ? String(body.message).trim().slice(0, 2000) : null;

    if (!jobId) return res.status(400).json({ success: false, error: 'Job is required.' });
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    const phone = normalizePhone(phoneRaw);
    if (!isValidNepalPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Nepal mobile number (e.g. 98XXXXXXXX).',
      });
    }

    const { data: job, error: jobErr } = await admin
      .from('jobs')
      .select('id, title, status, approved_by_agency, application_deadline')
      .eq('id', jobId)
      .maybeSingle();

    if (jobErr) {
      console.error('job lookup', jobErr);
      return res.status(500).json({ success: false, error: 'Could not verify job. Please try again.' });
    }
    if (!job) return res.status(404).json({ success: false, error: 'Job not found.' });
    if (job.status !== 'published' || !job.approved_by_agency) {
      return res.status(400).json({ success: false, error: 'This job is not open for applications.' });
    }
    if (job.application_deadline) {
      const dl = new Date(job.application_deadline);
      if (!Number.isNaN(dl.getTime()) && dl < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'The application deadline for this job has passed.',
        });
      }
    }

    let candidateId = null;
    const { data: byPhoneRows, error: phoneErr } = await admin
      .from('candidate_profiles')
      .select('id')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    if (phoneErr) {
      console.error('phone lookup', phoneErr);
      return res.status(500).json({
        success: false,
        error: 'Could not process application. Please try again.',
      });
    }
    if (byPhoneRows && byPhoneRows.length) candidateId = byPhoneRows[0].id;

    if (candidateId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recent } = await admin
        .from('applications')
        .select('id, application_reference')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .gte('applied_at', since)
        .limit(1);
      if (recent && recent.length) {
        return res.status(200).json({
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
          registration_source: 'public_application',
          seeker_status: 'active',
          profile_completion: 50,
          is_verified: false,
        })
        .select('id')
        .single();
      if (createErr || !created) {
        console.error('candidate create', createErr);
        return res.status(500).json({
          success: false,
          error: 'Could not save your application. Please try again or contact CareerJob.',
        });
      }
      candidateId = created.id;
    } else {
      const patch = { updated_at: new Date().toISOString() };
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

    if (existingAppRows && existingAppRows.length) {
      return res.status(200).json({
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
      console.error('application create', appErr);
      return res.status(500).json({
        success: false,
        error: 'Could not create application. Please try again.',
      });
    }

    try {
      await admin.from('application_status_history').insert({
        application_id: app.id,
        from_status: null,
        to_status: 'applied',
        notes: 'Public application submitted (no login)',
        changed_by: null,
      });
    } catch (_) {
      /* non-fatal */
    }

    return res.status(200).json({
      success: true,
      application_reference: reference,
      message:
        'Your application has been received. CareerJob will review it and contact you if appropriate.',
    });
  } catch (e) {
    console.error('public-apply fatal', e);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again later.',
    });
  }
};
