import { HttpError } from "../errors/HttpError.js";
import {
  findOfferInsight,
  saveOfferInsight,
} from "../models/offer-insight.model.js";
import { parseId } from "../utils/parse-id.js";
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
import {
  MAX_OFFER_REPOSITORIES,
  selectRepositories,
} from "./offers/repository-selection.service.js";
import { getProfile } from "./profile.service.js";

const MAX_OFFERS = 50;
const INSIGHT_SEED = 7;

async function collectSkills(userId, profile) {
  const names = profile.skills.map((skill) => skill.name);
  const { repositories } = await getRepositories(userId);
  for (const repository of repositories) {
    if (repository.status === "done") {
      names.push(...repository.skills.map((skill) => skill.name));
    }
  }
  return new Set(names.map((name) => name.toLowerCase()));
}

function isFresh(saved, offer) {
  if (!saved) {
    return false;
  }
  return !offer.updatedAt || saved.createdAt >= new Date(offer.updatedAt);
}

async function requireOffer(offerKey) {
  parseId(offerKey, "OFFER_NOT_FOUND");
  const offer = await findOffer(offerKey);
  if (!offer) {
    throw new HttpError(404, "OFFER_NOT_FOUND");
  }
  return offer;
}

async function findFreshInsight(profile, offer) {
  const saved = await findOfferInsight(
    profile.sourceAnalysisId,
    offer.offerKey,
  );
  return isFresh(saved, offer) ? saved : null;
}

export async function getOffers(userId) {
  const profile = await getProfile(userId);
  const [offers, userSkills] = await Promise.all([
    getOfferPool(),
    collectSkills(userId, profile),
  ]);
  return rankOffers(offers, userSkills, MAX_OFFERS);
}

export async function getOfferDetails(userId, offerKey) {
  const profile = await getProfile(userId);
  const offer = await requireOffer(offerKey);
  const userSkills = await collectSkills(userId, profile);
  return {
    ...offer,
    match: matchOffer(offer, userSkills),
    insight: await findFreshInsight(profile, offer),
  };
}

export async function getOfferRepositories(userId, offerKey) {
  const offer = await requireOffer(offerKey);
  const { login, repositories } = await getRepositories(userId);
  if (!login) {
    return [];
  }
  return selectRepositories(offer, repositories, MAX_OFFER_REPOSITORIES);
}

export async function getOfferInsight(userId, offerKey) {
  const profile = await getProfile(userId);
  const offer = await requireOffer(offerKey);

  const saved = await findFreshInsight(profile, offer);
  if (saved) {
    return { ...saved, cached: true };
  }

  const { result } = await getAnalysis(userId, profile.sourceAnalysisId);
  const candidate = {
    seniority: profile.seniority,
    summary: result.analysis.summary,
    profile: { headline: profile.headline },
  };
  const match = matchOffer(offer, await collectSkills(userId, profile));
  const llm = await resolveLlm(userId);
  const raw = await llm.completeJson({
    system: OFFER_INSIGHT_SYSTEM_PROMPT,
    user: buildOfferInsightUserMessage(offer, candidate, match),
    temperature: 0,
    seed: INSIGHT_SEED,
  });

  const parsed = offerInsightSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.comment) {
    throw new HttpError(502, "AI_EMPTY_RESPONSE");
  }

  const insight = await saveOfferInsight({
    analysisId: profile.sourceAnalysisId,
    offerKey,
    comment: parsed.data.comment,
  });
  return { ...insight, cached: false };
}
