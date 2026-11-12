import { request } from "@/shared/api/httpClient";

export function fetchAnalyses(signal) {
  return request("/analyses", { signal });
}

export function fetchAnalysis(id, signal) {
  return request(`/analyses/${id}`, { signal });
}

export function deleteAnalysis(id) {
  return request(`/analyses/${id}`, { method: "DELETE" });
}
