import { skillView } from "./skill.view.js";

export function candidateView(candidate) {
  return {
    id: candidate.id,
    displayName: candidate.displayName,
    headline: candidate.headline,
    seniority: candidate.seniority,
    location: candidate.location,
    score: candidate.score,
    skills: candidate.skills.map(skillView),
    match: candidate.match ?? null,
  };
}
