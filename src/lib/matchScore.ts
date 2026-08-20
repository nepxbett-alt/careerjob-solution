/**
 * Simple explainable match score (V1) — not AI.
 * Skills 40% · Experience 25% · Location 15% · Education 10% · Preferences 10%
 */
export interface MatchInput {
  jobTitle: string;
  jobLocation: string;
  jobSkills?: string[] | null;
  jobExperience?: string | null;
  jobEducation?: string | null;
  candidateSkills?: string[] | null;
  candidateLocation?: string | null;
  candidateEducation?: string | null;
  candidateExperienceYears?: number | null;
  desiredPosition?: string | null;
}

export interface MatchResult {
  score: number;
  reasons: { ok: boolean; text: string }[];
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function computeMatchScore(input: MatchInput): MatchResult {
  const reasons: { ok: boolean; text: string }[] = [];
  let score = 0;

  // Skills 40
  const jobSkills = (input.jobSkills || []).map((s) => s.toLowerCase());
  const candSkills = (input.candidateSkills || []).map((s) => s.toLowerCase());
  if (jobSkills.length === 0) {
    score += 20; // neutral partial
    reasons.push({ ok: true, text: 'No specific skills listed on job' });
  } else if (candSkills.length === 0) {
    reasons.push({ ok: false, text: 'Add skills to your profile for a better match' });
  } else {
    const matched = jobSkills.filter((js) =>
      candSkills.some((cs) => cs.includes(js) || js.includes(cs))
    );
    const ratio = matched.length / jobSkills.length;
    score += Math.round(ratio * 40);
    reasons.push({
      ok: matched.length > 0,
      text:
        matched.length > 0
          ? `${matched.length}/${jobSkills.length} job skills overlap`
          : 'Skills do not overlap yet',
    });
  }

  // Experience 25
  const expText = (input.jobExperience || '').toLowerCase();
  const years = input.candidateExperienceYears;
  if (!expText) {
    score += 12;
    reasons.push({ ok: true, text: 'No strict experience requirement stated' });
  } else if (years == null) {
    reasons.push({ ok: false, text: 'Add years of experience on your profile' });
  } else {
    const need = parseInt(expText.replace(/\D/g, ''), 10);
    if (!need || years >= need) {
      score += 25;
      reasons.push({ ok: true, text: `Experience (${years} yrs) meets role` });
    } else {
      score += Math.round((years / need) * 25);
      reasons.push({ ok: false, text: `Role asks ~${need}+ yrs; you have ${years}` });
    }
  }

  // Location 15 — Pokhara-focused
  const jobLoc = (input.jobLocation || '').toLowerCase();
  const candLoc = (input.candidateLocation || '').toLowerCase();
  if (jobLoc.includes('pokhara') || candLoc.includes('pokhara') || !jobLoc) {
    score += 15;
    reasons.push({ ok: true, text: 'Location aligns with Pokhara' });
  } else if (candLoc && jobLoc.includes(candLoc.split(',')[0].trim())) {
    score += 15;
    reasons.push({ ok: true, text: 'Location matches' });
  } else {
    score += 5;
    reasons.push({ ok: false, text: 'Location may differ' });
  }

  // Education 10
  const jobEdu = (input.jobEducation || '').toLowerCase();
  const candEdu = (input.candidateEducation || '').toLowerCase();
  if (!jobEdu) {
    score += 5;
    reasons.push({ ok: true, text: 'No education filter stated' });
  } else if (candEdu && (candEdu.includes(jobEdu) || jobEdu.includes(candEdu.split(' ')[0]))) {
    score += 10;
    reasons.push({ ok: true, text: 'Education aligns' });
  } else if (candEdu) {
    score += 4;
    reasons.push({ ok: false, text: 'Education may differ from requirement' });
  } else {
    reasons.push({ ok: false, text: 'Add education to improve match' });
  }

  // Preferences 10 — desired position vs title
  const desired = (input.desiredPosition || '').toLowerCase();
  const titleTokens = tokenize(input.jobTitle);
  if (!desired) {
    score += 4;
  } else {
    const hit = titleTokens.some((t) => desired.includes(t) || t.includes(desired.split(' ')[0]));
    if (hit) {
      score += 10;
      reasons.push({ ok: true, text: 'Desired position fits job title' });
    } else {
      score += 2;
      reasons.push({ ok: false, text: 'Title differs from desired position' });
    }
  }

  return { score: Math.min(100, Math.max(0, score)), reasons };
}
