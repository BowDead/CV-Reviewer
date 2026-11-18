import { z } from "zod";
import { stringList, text } from "./cv-analysis.schema.js";

const repoReviewSchema = z.object({
  id: text,
  summary: text,
  falsePositives: stringList,
  additional: stringList,
});

export const repoAnalysisSchema = z.object({
  repositories: z
    .array(repoReviewSchema.nullable().catch(null))
    .catch([])
    .transform((items) => items.filter(Boolean)),
});
