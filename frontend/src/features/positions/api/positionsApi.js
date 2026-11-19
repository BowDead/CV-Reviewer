import { request } from "@/shared/api/httpClient";

function positionPath(positionId) {
  return `/positions/${encodeURIComponent(positionId)}`;
}

export function fetchPositions(signal) {
  return request("/positions", { signal });
}

export function fetchPosition(positionId, signal) {
  return request(positionPath(positionId), { signal });
}

export function createPosition(body) {
  return request("/positions", { method: "POST", body });
}

export function updatePosition(positionId, body) {
  return request(positionPath(positionId), { method: "PUT", body });
}

export function deletePosition(positionId) {
  return request(positionPath(positionId), { method: "DELETE" });
}

export function suggestSkills(body) {
  return request("/positions/skill-suggestions", { method: "POST", body });
}
