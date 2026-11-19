import { request } from "@/shared/api/httpClient";

function offerPath(offerKey) {
  return `/offers/${encodeURIComponent(offerKey)}`;
}

export function fetchOffers(signal) {
  return request("/offers", { signal });
}

export function fetchOffer(offerKey, signal) {
  return request(offerPath(offerKey), { signal });
}

export function fetchOfferInsight(offerKey) {
  return request(`${offerPath(offerKey)}/insight`, { method: "POST" });
}

export function fetchOfferRepositories(offerKey, signal) {
  return request(`${offerPath(offerKey)}/repositories`, { signal });
}
