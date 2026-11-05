import { request } from "@/shared/api/httpClient";

export function fetchCurrentUser(signal) {
  return request("/auth/me", { signal });
}

export function loginUser(credentials) {
  return request("/auth/login", { method: "POST", body: credentials });
}

export function registerUser(data) {
  return request("/auth/register", { method: "POST", body: data });
}

export function logoutUser() {
  return request("/auth/logout", { method: "POST" });
}
