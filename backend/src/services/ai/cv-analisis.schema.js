import { z } from "zod";

export const SENIORITY_LEVELS = ["Stażysta", "Junior", "Mid", "Senior", "Lead"];

const text = z.string().trim().catch("");

const score = z
  .union([z.number(), z.string().trim().min(1).pipe(z.coerce.number())])
  .refine(Number.isFinite)
  .transform((value) => Math.min(10, Math.max(1, Math.round(value * 10) / 10)))
  .catch(null);

const stringList = z
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

export const cvAnalysisSchema = z.object({
  overallScore: score,
  seniority: z.enum(SENIORITY_LEVELS).catch(null),
  summary: text,
  categories: listOf(z.object({ name: text, score, comment: text })),
  strengths: stringList,
  weaknesses: stringList,
  missingSections: stringList,
  actionItems: stringList,
  rewrites: listOf(z.object({ original: text, improved: text, reason: text })),
  suggestedRoles: stringList,
  skillsToAdd: stringList,
  profile: profileSchema.catch(() => profileSchema.parse({})),
});
