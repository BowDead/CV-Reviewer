import { request } from "@/shared/api/httpClient";

export function fetchSavedCv(id) {
  return request(`/cv/saved/${id}`);
}

export function saveCreatorCv(body) {
  return request("/cv/saved/creator", { method: "POST", body });
}
