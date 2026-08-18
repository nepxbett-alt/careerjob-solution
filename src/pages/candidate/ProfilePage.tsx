import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyCandidateProfile, upsertCandidateProfile, uploadCV, type CandidateProfile } from '../../services/candidateService';
import { Button } from '../../components/ui/Button';
import { LOCATIONS } from '../../lib/config';

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [cp, setCp] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Pokhara');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');

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
        } else if (authProfile) {
          setFullName(authProfile.full_name || '');
          setPhone(authProfile.phone || '');
        }
      })
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false));
  }, [user, authProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
        email: user.email || null,
      });
      // also update profiles table name/phone
      await refreshProfile();
      setCp(updated);
      setMessage('Profile saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
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
      // ensure profile exists first
      if (!cp) {
        await upsertCandidateProfile(user.id, {
          full_name: fullName.trim() || 'Candidate',
          phone: phone.trim() || '9800000000',
          location,
          email: user.email || null,
        });
      }
      const path = await uploadCV(user.id, file);
      setCp((prev) => (prev ? { ...prev, cv_url: path } : prev));
      setMessage('CV uploaded successfully');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading profile…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">My Profile</h1>
      {cp && (
        <p className="text-sm text-gray-500 mb-4">
          Profile completion: <strong>{cp.profile_completion}%</strong>
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-xl border p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name *</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone *</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg"
            placeholder="98XXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg bg-white"
          >
            {LOCATIONS.filter((l) => l !== 'All Nepal').map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Education</label>
          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg"
            placeholder="e.g. +2, Bachelor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg"
            placeholder="Waiter, Customer service"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CV / Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleCV}
            disabled={uploading}
            className="w-full text-sm"
          />
          {cp?.cv_url && (
            <p className="text-xs text-green-600 mt-1">CV uploaded ✓</p>
          )}
          {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
