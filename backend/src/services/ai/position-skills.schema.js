import { z } from "zod";
import { stringList } from "./cv-analysis.schema.js";

export const positionSkillsSchema = z.object({
  required: stringList,
  niceToHave: stringList,
  falsePositives: stringList,
});
