import { request } from "@/shared/api/httpClient";

export function analyzeCv(text, source, signal) {
  return request("/cv/analyze", {
    method: "POST",
    body: { text, ...source },
    signal,
  });
}
