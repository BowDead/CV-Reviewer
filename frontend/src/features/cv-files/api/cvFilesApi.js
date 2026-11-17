import { request } from "@/shared/api/httpClient";

export function fetchSavedCvs(signal) {
  return request("/cv/saved", { signal });
}

export function fetchSavedCv(id) {
  return request(`/cv/saved/${id}`);
}

export function deleteSavedCv(id) {
  return request(`/cv/saved/${id}`, { method: "DELETE" });
}
