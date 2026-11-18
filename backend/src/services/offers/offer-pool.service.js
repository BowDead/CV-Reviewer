import { getSkillDetector } from "../skills/skill-dictionary.service.js";
import { fetchAllJobs } from "./solidjobs.client.js";

const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const MAX_DESCRIPTION_CHARS = 1500;
const NICE_TO_HAVE = "NiceToHave";

let cache = null;
let loading = null;

function stripHtml(html) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatLocation(job) {
  const places = (job.locations ?? []).join(", ");
  const mode = job.isRemote ? "zdalnie" : job.isHybrid ? "hybrydowo" : "";
  return [places, mode].filter(Boolean).join(" · ");
}

function normalizeSkill(name, detector) {
  const known = detector.find(name);
  if (known) {
    return [known.name];
  }
  const parts = name.split("/").map((part) => detector.find(part));
  if (parts.length > 1 && parts.every(Boolean)) {
    return parts.map((part) => part.name);
  }
  return [name.trim()];
}

function skillNames(job, detector, niceToHave) {
  const names = (job.skills ?? [])
    .filter((skill) => (skill.level === NICE_TO_HAVE) === niceToHave)
    .flatMap((skill) => normalizeSkill(skill.name ?? "", detector))
    .filter(Boolean);
  return [...new Set(names)];
}

function toOffer(job, detector) {
  return {
    offerKey: job.jobOfferKey,
    title: job.title ?? "",
    company: job.company ?? "",
    location: formatLocation(job),
    url: job.url ?? "",
    updatedAt: job.updatedAt ?? null,
    experienceLevel: job.experienceLevel ?? "",
    requiredSkills: skillNames(job, detector, false),
    niceToHaveSkills: skillNames(job, detector, true),
    description: stripHtml(job.description).slice(0, MAX_DESCRIPTION_CHARS),
  };
}

async function loadPool() {
  const [jobs, detector] = await Promise.all([
    fetchAllJobs(),
    getSkillDetector(),
  ]);
  return jobs
    .filter((job) => job.jobOfferKey)
    .map((job) => toOffer(job, detector));
}

export async function getOfferPool() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.offers;
  }
  loading ??= loadPool()
    .then((offers) => {
      cache = { offers, fetchedAt: Date.now() };
      return offers;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export async function findOffer(offerKey) {
  const offers = await getOfferPool();
  return offers.find((offer) => offer.offerKey === offerKey) ?? null;
}
