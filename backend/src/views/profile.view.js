import { skillView } from "./skill.view.js";

export function profileView(profile) {
  return {
    sourceAnalysisId: profile.sourceAnalysisId,
    displayName: profile.displayName,
    headline: profile.headline,
    seniority: profile.seniority,
    location: profile.location,
    score: profile.score,
    isPublished: profile.isPublished,
    publishedAt: profile.publishedAt,
    skills: profile.skills.map(skillView),
  };
}
