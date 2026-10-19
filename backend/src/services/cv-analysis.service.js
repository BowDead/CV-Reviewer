import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import { anonymize } from "./anonymizer.service.js";
import { completeJson } from "./ai/groq.client.js";
import {
  CV_ANALYSIS_SYSTEM_PROMPT,
  buildCvAnalysisUserMessage,
} from "./ai/cv-analysis.prompt.js";
import { cvAnalysisSchema } from "./ai/cv-analysis.schema.js";

const MAX_AI_CHARS = 14_000;
const MAX_INPUT_CHARS = 50_000;

function resolveGroqApiKey({ userApiKey } = {}) {
  return userApiKey || env.groqApiKey;
}

export async function analyzeCv(text, options = {}) {
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "Brak tekstu CV do analizy.");
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new HttpError(413, "Tekst CV jest za długi.");
  }

  const anonymized = anonymize(text);
  const truncated = anonymized.text.length > MAX_AI_CHARS;
  const cvText = truncated
    ? anonymized.text.slice(0, MAX_AI_CHARS)
    : anonymized.text;

  const raw = await completeJson({
    apiKey: resolveGroqApiKey(options),
    system: CV_ANALYSIS_SYSTEM_PROMPT,
    user: buildCvAnalysisUserMessage(cvText),
  });

  const parsed = cvAnalysisSchema.safeParse(raw);
  if (
    !parsed.success ||
    (parsed.data.overallScore === null && !parsed.data.summary)
  ) {
    throw new HttpError(
      502,
      "Model AI zwrócił odpowiedź bez oceny. Spróbuj ponownie.",
    );
  }

  return {
    analysis: parsed.data,
    anonymization: anonymized.counts,
    truncated,
    model: env.groqModel,
  };
}
