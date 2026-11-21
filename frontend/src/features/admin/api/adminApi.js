import { request } from "@/shared/api/httpClient";

export function fetchReports(resolved, signal) {
  return request(`/admin/reports?resolved=${resolved}`, { signal });
}

export function resolveReport(reportId) {
  return request(`/admin/reports/${encodeURIComponent(reportId)}/resolve`, {
    method: "POST",
  });
}

export function fetchUsers(query, signal) {
  return request(`/admin/users?${query}`, { signal });
}

export function setUserBlocked(userId, blocked) {
  return request(`/admin/users/${encodeURIComponent(userId)}/block`, {
    method: "PUT",
    body: { blocked },
  });
}

export function setPositionBlocked(positionId, blocked) {
  return request(`/admin/positions/${encodeURIComponent(positionId)}/block`, {
    method: "PUT",
    body: { blocked },
  });
}

export function fetchDictionary(query, signal) {
  return request(`/admin/skills?${query}`, { signal });
}

export function createSkill(body) {
  return request("/admin/skills", { method: "POST", body });
}

export function updateSkill(skillId, body) {
  return request(`/admin/skills/${encodeURIComponent(skillId)}`, {
    method: "PATCH",
    body,
  });
}
