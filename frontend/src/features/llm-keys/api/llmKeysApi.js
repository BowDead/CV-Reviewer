import { request } from "@/shared/api/httpClient";

export function fetchLlmKeys(signal) {
  return request("/llm-keys", { signal });
}

export function createLlmKey(data) {
  return request("/llm-keys", { method: "POST", body: data });
}

export function updateLlmKeyOrder(ids) {
  return request("/llm-keys/order", { method: "PUT", body: { ids } });
}

export function deleteLlmKey(id) {
  return request(`/llm-keys/${id}`, { method: "DELETE" });
}
