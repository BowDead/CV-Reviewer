import { request } from "@/shared/api/httpClient";

export function fetchProfile(signal) {
  return request("/profile", { signal });
}

export function saveProfileSource(analysisId) {
  return request("/profile", { method: "PUT", body: { analysisId } });
}

export function saveProfileFields(fields) {
  return request("/profile", { method: "PATCH", body: fields });
}

export function saveProfileSkills(skillIds) {
  return request("/profile/skills", { method: "PUT", body: { skillIds } });
}

export function saveProfilePublication(published) {
  return request("/profile/publication", {
    method: "PUT",
    body: { published },
  });
}

export function fetchSkills(signal) {
  return request("/skills", { signal });
}

export function fetchAnalyses(signal) {
  return request("/analyses", { signal });
}

export function fetchSavedCvs(signal) {
  return request("/cv/saved", { signal });
}
