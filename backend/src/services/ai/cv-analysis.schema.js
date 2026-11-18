import { z } from "zod";

export const SENIORITY_LEVELS = ["Stażysta", "Junior", "Mid", "Senior", "Lead"];

export const text = z.string().trim().catch("");

export const stringList = z
  .array(z.unknown())
  .catch([])
  .transform((items) =>
    items
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean),
  );

function listOf(itemSchema) {
  return z
    .array(itemSchema.nullable().catch(null))
    .catch([])
    .transform((items) => items.filter(Boolean));
}

const profileSchema = z.object({
  headline: text,
  location: text,
  experience: listOf(
    z.object({
      title: text,
      company: text,
      start: text,
      end: text,
      highlights: stringList,
    }),
  ),
  education: listOf(
    z.object({ degree: text, school: text, start: text, end: text }),
  ),
  skills: listOf(z.object({ category: text, items: stringList })),
  languages: listOf(z.object({ name: text, level: text })),
  certifications: stringList,
});

const skillReviewSchema = z.object({
  falsePositives: stringList,
  additional: stringList,
});

const level = z.coerce.number().int().min(0).max(2);

const criterionSchema = z.object({
  id: z.string().trim(),
  level,
  evidence: text,
  comment: text,
});

export const cvAnalysisSchema = z.object({
  criteria: listOf(criterionSchema),
  seniority: z.enum(SENIORITY_LEVELS).catch(null),
  summary: text,
  strengths: stringList,
  weaknesses: stringList,
  missingSections: stringList,
  actionItems: stringList,
  rewrites: listOf(z.object({ original: text, improved: text, reason: text })),
  suggestedRoles: stringList,
  skillsToAdd: stringList,
  skillReview: skillReviewSchema.catch(() => skillReviewSchema.parse({})),
  profile: profileSchema.catch(() => profileSchema.parse({})),
});
