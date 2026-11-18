import { z } from "zod";
import { text } from "./cv-analysis.schema.js";

export const offerInsightSchema = z.object({
  comment: text,
});
