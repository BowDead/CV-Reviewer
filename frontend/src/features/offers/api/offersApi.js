import { request } from "@/shared/api/httpClient";

export function fetchOffers(analysisId, signal) {
  const query = new URLSearchParams({ analysisId });
  return request(`/offers?${query}`, { signal });
}

export function fetchOfferInsight(offerKey, analysisId) {
  return request(`/offers/${encodeURIComponent(offerKey)}/insight`, {
    method: "POST",
    body: { analysisId },
  });
}

export function fetchOfferRepositories(offerKey, signal) {
  return request(`/offers/${encodeURIComponent(offerKey)}/repositories`, {
    signal,
  });
}
