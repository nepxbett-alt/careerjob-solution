import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyCandidateProfile, upsertCandidateProfile, uploadCV, type CandidateProfile } from '../../services/candidateService';
import { Button } from '../../components/ui/Button';
import { AiAssistPanel } from '../../components/AiAssistPanel';
import { LOCATIONS } from '../../lib/config';

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [cp, setCp] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Pokhara');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceNotes, setExperienceNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    getMyCandidateProfile(user.id)
      .then((p) => {
        setCp(p);
        if (p) {
          setFullName(p.full_name || '');
          setPhone(p.phone || '');
          setLocation(p.location || 'Pokhara');
          setEducation(p.education || '');
          setSkills((p.skills || []).join(', '));
          setHeadline(p.headline || '');
          setBio(p.bio || '');
        } else if (authProfile) {
          setFullName(authProfile.full_name || '');
          setPhone(authProfile.phone || '');
        }
      })
      .catch(() => setError("We couldn't load your profile."))
      .finally(() => setLoading(false));
  }, [user, authProfile]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Enter your full name';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) errs.phone = 'Enter a valid phone number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await upsertCandidateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        location,
        education: education.trim() || null,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        email: user.email || null,
      });
      await refreshProfile();
      setCp(updated);
      setMessage('Profile saved');
    } catch (err: any) {
      setError(err.message || "We couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      if (!cp) {
        if (!validate()) {
          setUploading(false);
          return;
        }
        await upsertCandidateProfile(user.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
          location,
          email: user.email || null,
        });
      }
      await uploadCV(user.id, file);
      const refreshed = await getMyCandidateProfile(user.id);
      setCp(refreshed);
      setMessage('CV uploaded successfully');
    } catch (err: any) {
      setError(err.message || 'Upload failed. Use PDF, DOC, DOCX, JPG or PNG under 5 MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading profile…</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <a href="/candidate/cv" className="text-sm font-semibold text-[#0066FF]">Create CV →</a>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        {cp ? (
          <>Profile completion <strong className="text-slate-800">{cp.profile_completion}%</strong></>
        ) : (
          'Complete required fields so you can apply quickly.'
        )}
      </p>

      {/* Progress bar */}
      {cp && (
        <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden" role="progressbar" aria-valuenow={cp.profile_completion} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-[#0066FF] rounded-full transition-all" style={{ width: `${cp.profile_completion}%` }} />
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm" noValidate>
        <div>
          <label htmlFor="pf-name" className="cj-label">Full name <span className="text-red-500">*</span></label>
          <input
            id="pf-name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="cj-input"
            aria-invalid={!!fieldErrors.fullName}
          />
          {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="pf-phone" className="cj-label">Phone <span className="text-red-500">*</span></label>
          <input
            id="pf-phone"
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="cj-input"
            placeholder="98XXXXXXXX"
            aria-invalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
        </div>
        <div>
          <label htmlFor="pf-loc" className="cj-label">Location</label>
          <select id="pf-loc" value={location} onChange={(e) => setLocation(e.target.value)} className="cj-input">
            {LOCATIONS.filter((l) => l !== 'All Pokhara').map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-edu" className="cj-label">Education <span className="text-slate-400 font-normal">(optional)</span></label>
          <input id="pf-edu" value={education} onChange={(e) => setEducation(e.target.value)} className="cj-input" placeholder="e.g. +2, Bachelor" />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label htmlFor="pf-headline" className="cj-label mb-0">Professional headline</label>
          </div>
          <input id="pf-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className="cj-input" placeholder="e.g. Hospitality professional · 2 years" />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label htmlFor="pf-bio" className="cj-label mb-0">Professional summary</label>
            <AiAssistPanel
              task="cv_summary"
              label="Generate summary"
              buildInput={() =>
                [
                  fullName && `Name: ${fullName}`,
                  location && `Location: ${location}`,
                  education && `Education: ${education}`,
                  skills && `Skills: ${skills}`,
                  experienceNotes && `Experience: ${experienceNotes}`,
                  headline && `Headline: ${headline}`,
                  bio && `Current summary: ${bio}`,
                ]
                  .filter(Boolean)
                  .join('\n')
              }
              onAccept={(result) => setBio(result)}
            />
          </div>
          <textarea
            id="pf-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="cj-input min-h-[100px] py-2.5"
            placeholder="Short summary of your background…"
            rows={4}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label htmlFor="pf-exp" className="cj-label mb-0">Work experience notes</label>
            <AiAssistPanel
              task="improve_experience"
              label="Improve with AI"
              buildInput={() => experienceNotes}
              onAccept={(result) => setExperienceNotes(result)}
            />
          </div>
          <textarea
            id="pf-exp"
            value={experienceNotes}
            onChange={(e) => setExperienceNotes(e.target.value)}
            className="cj-input min-h-[88px] py-2.5"
            placeholder="e.g. Waiter at hotel. Took orders and served customers."
            rows={3}
          />
          <p className="text-xs text-slate-400 mt-1">Facts only — AI rewrites wording, does not invent achievements.</p>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label htmlFor="pf-skills" className="cj-label mb-0">Skills</label>
            <AiAssistPanel
              task="improve_cv"
              label="Improve CV text"
              buildInput={() =>
                [
                  headline && `Headline: ${headline}`,
                  bio && `Summary: ${bio}`,
                  education && `Education: ${education}`,
                  skills && `Skills: ${skills}`,
                  experienceNotes && `Experience: ${experienceNotes}`,
                ]
                  .filter(Boolean)
                  .join('\n')
              }
              onAccept={(result) => {
                // Prefer putting polished text into bio if multi-line, else skills
                if (result.includes('\n') || result.length > 80) setBio(result);
                else setSkills(result);
              }}
            />
          </div>
          <input id="pf-skills" value={skills} onChange={(e) => setSkills(e.target.value)} className="cj-input" placeholder="Waiter, Customer service" />
          <p className="text-xs text-slate-400 mt-1">Comma-separated skills</p>
        </div>

        <div>
          <label htmlFor="pf-cv" className="cj-label">CV / Resume</label>
          <input
            id="pf-cv"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf"
            onChange={handleCV}
            disabled={uploading}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-800 file:font-medium file:text-sm"
          />
          <p className="text-xs text-slate-400 mt-1.5">PDF, DOC, DOCX, JPG or PNG · max 5 MB</p>
          {cp?.cv_url && <p className="text-xs text-emerald-600 mt-1 font-medium">CV on file ✓</p>}
          {uploading && <p className="text-xs text-slate-500 mt-1">Uploading…</p>}
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {message && <p className="text-sm text-emerald-600" role="status">{message}</p>}

        <Button type="submit" fullWidth loading={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
