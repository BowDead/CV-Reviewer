import { request } from "@/shared/api/httpClient";

export function fetchRepositories(signal) {
  return request("/github/repositories", { signal });
}

export function saveGithubLogin(login) {
  return request("/github/account", { method: "PUT", body: { login } });
}

export function deleteGithubAccount() {
  return request("/github/account", { method: "DELETE" });
}

export function analyzeRepositories() {
  return request("/github/repositories/analyze", { method: "POST" });
}
