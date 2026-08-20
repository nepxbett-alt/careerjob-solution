import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyCandidateProfile,
  upsertCandidateProfile,
  saveCandidateCvFields,
  type CandidateProfile,
} from '../../services/candidateService';
import { CvBuilder, type CvData } from '../../components/CvBuilder';
import { Button } from '../../components/ui/Button';

export default function CvPage() {
  const { user, profile } = useAuth();
  const [cp, setCp] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyCandidateProfile(user.id)
      .then(setCp)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading…</p>;

  const initial: CvData = {
    full_name: cp?.full_name || profile?.full_name || '',
    phone: cp?.phone || profile?.phone || '',
    email: cp?.email || user?.email || '',
    location: cp?.location || 'Pokhara',
    headline: cp?.headline || '',
    bio: cp?.bio || '',
    education: cp?.education || '',
    experience_notes: (cp as any)?.experience_notes || '',
    skills: (cp?.skills || []).join(', '),
    languages: (cp?.languages || []).join(', '),
    desired_position: (cp as any)?.desired_position || '',
  };

  const handleSave = async (data: CvData) => {
    if (!user) throw new Error('Sign in required');
    const skills = (data.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
    const languages = (data.languages || '').split(',').map((s) => s.trim()).filter(Boolean);

    if (!cp) {
      const created = await upsertCandidateProfile(user.id, {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        location: data.location || 'Pokhara',
        headline: data.headline || null,
        bio: data.bio || null,
        education: data.education || null,
        skills,
        languages,
      });
      await saveCandidateCvFields(created.id, {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        location: data.location,
        headline: data.headline,
        bio: data.bio,
        education: data.education,
        skills,
        languages,
        desired_position: data.desired_position,
        experience_notes: data.experience_notes,
      });
      const refreshed = await getMyCandidateProfile(user.id);
      setCp(refreshed);
      return;
    }

    await saveCandidateCvFields(cp.id, {
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      location: data.location,
      headline: data.headline,
      bio: data.bio,
      education: data.education,
      skills,
      languages,
      desired_position: data.desired_position,
      experience_notes: data.experience_notes,
    });
    const refreshed = await getMyCandidateProfile(user.id);
    setCp(refreshed);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4 flex flex-wrap gap-2 print:hidden">
        <Link to="/candidate/profile"><Button size="sm" variant="outline">Profile</Button></Link>
        <Link to="/jobs"><Button size="sm" variant="ghost">Browse jobs</Button></Link>
      </div>
      <CvBuilder initial={initial} onSave={handleSave} title="My CV" showAi />
    </div>
  );
}
