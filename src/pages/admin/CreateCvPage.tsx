import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CvBuilder, type CvData } from '../../components/CvBuilder';
import { createWalkInCandidate, saveCandidateCvFields } from '../../services/candidateService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

/**
 * Admin / walk-in: enter candidate details, build a professional CV, save to candidate record.
 */
export default function CreateCvPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initial: CvData = {
    full_name: '',
    phone: '',
    email: '',
    location: 'Pokhara',
    headline: '',
    bio: '',
    education: '',
    experience_notes: '',
    skills: '',
    languages: 'Nepali, English',
    desired_position: '',
  };

  const handleSave = async (data: CvData) => {
    setError(null);
    if (!user?.id) throw new Error('Not signed in');

    if (!candidateId) {
      const skillsArr = data.skills
        ? data.skills.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const langArr = data.languages
        ? data.languages.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const created = await createWalkInCandidate({
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        location: data.location?.trim() || 'Pokhara',
        education: data.education?.trim() || undefined,
        skills: skillsArr.length ? skillsArr : undefined,
        desired_position: data.desired_position?.trim() || undefined,
        registeredBy: user.id,
        notes: 'Created via Admin Create CV',
      });
      const id = (created as { id: string }).id;
      setCandidateId(id);
      await saveCandidateCvFields(id, {
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        location: data.location?.trim() || null,
        headline: data.headline || null,
        bio: data.bio || null,
        education: data.education || null,
        experience_notes: data.experience_notes || null,
        skills: skillsArr,
        languages: langArr,
        desired_position: data.desired_position || null,
      });
      return;
    }

    const skillsArr = data.skills
      ? data.skills.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
      : [];
    const langArr = data.languages
      ? data.languages.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
      : [];
    await saveCandidateCvFields(candidateId, {
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      location: data.location?.trim() || null,
      headline: data.headline || null,
      bio: data.bio || null,
      education: data.education || null,
      experience_notes: data.experience_notes || null,
      skills: skillsArr,
      languages: langArr,
      desired_position: data.desired_position || null,
    });
  };

  return (
    <div className="max-w-5xl pb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create CV</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Walk-in or phone: enter details, polish with AI, print a professional CV, and save to the candidate file.
          </p>
        </div>
        {candidateId && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/candidates/${candidateId}`)}>
            Open candidate →
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <CvBuilder initial={initial} onSave={handleSave} title="Professional CV" showAi />
    </div>
  );
}
