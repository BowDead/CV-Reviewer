import { request } from "@/shared/api/httpClient";

export function fetchCandidates(query, signal) {
  return request(`/candidates?${query}`, { signal });
}
