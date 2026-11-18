import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import { findDefaultAnalysis } from "../models/analysis.model.js";
import {
  findOfferInsight,
  saveOfferInsight,
} from "../models/offer-insight.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import {
  OFFER_INSIGHT_SYSTEM_PROMPT,
  buildOfferInsightUserMessage,
} from "./ai/offer-insight.prompt.js";
import { offerInsightSchema } from "./ai/offer-insight.schema.js";
import { getAnalysis } from "./analysis.service.js";
import { getRepositories } from "./github.service.js";
import { resolveLlm } from "./llm-key.service.js";
import { matchOffer, rankOffers } from "./offers/offer-matching.service.js";
import { findOffer, getOfferPool } from "./offers/offer-pool.service.js";

const MAX_OFFERS = 50;
const INSIGHT_SEED = 7;

const listSchema = z.object({
  analysisId: z.uuid("ANALYSIS_NOT_FOUND").optional(),
});

const insightSchema = z.object({
  analysisId: z.uuid("ANALYSIS_NOT_FOUND"),
});

async function resolveAnalysis(userId, analysisId) {
  if (analysisId) {
    return getAnalysis(userId, analysisId);
  }
  const analysis = await findDefaultAnalysis(userId);
  if (!analysis) {
    throw new HttpError(404, "ANALYSIS_NOT_FOUND");
  }
  return analysis;
}

async function collectSkills(userId, analysis) {
  const names = analysis.result.skills.map((skill) => skill.name);
  const { repositories } = await getRepositories(userId);
  for (const repository of repositories) {
    if (repository.status === "done") {
      names.push(...repository.skills.map((skill) => skill.name));
    }
  }
  return new Set(names.map((name) => name.toLowerCase()));
}

export async function getOffers(userId, input) {
  const { analysisId } = parseInput(listSchema, input);
  const analysis = await resolveAnalysis(userId, analysisId);
  const [offers, userSkills] = await Promise.all([
    getOfferPool(),
    collectSkills(userId, analysis),
  ]);
  return rankOffers(offers, userSkills, MAX_OFFERS);
}

export async function getOfferInsight(userId, offerKey, input) {
  parseId(offerKey, "OFFER_NOT_FOUND");
  const { analysisId } = parseInput(insightSchema, input);
  const analysis = await getAnalysis(userId, analysisId);
  const offer = await findOffer(offerKey);
  if (!offer) {
    throw new HttpError(404, "OFFER_NOT_FOUND");
  }

  const saved = await findOfferInsight(analysisId, offerKey);
  const offerChangedAt = offer.updatedAt ? new Date(offer.updatedAt) : null;
  if (saved && (!offerChangedAt || saved.createdAt >= offerChangedAt)) {
    return { ...saved, cached: true };
  }

  const userSkills = await collectSkills(userId, analysis);
  const match = matchOffer(offer, userSkills);
  const llm = await resolveLlm(userId);
  const raw = await llm.completeJson({
    system: OFFER_INSIGHT_SYSTEM_PROMPT,
    user: buildOfferInsightUserMessage(offer, analysis.result.analysis, match),
    temperature: 0,
    seed: INSIGHT_SEED,
  });

  const parsed = offerInsightSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.comment) {
    throw new HttpError(502, "AI_EMPTY_RESPONSE");
  }

  const insight = await saveOfferInsight({
    analysisId,
    offerKey,
    comment: parsed.data.comment,
  });
  return { ...insight, cached: false };
}
