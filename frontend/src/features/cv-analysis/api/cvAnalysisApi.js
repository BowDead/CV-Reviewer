import { request } from "@/shared/api/httpClient";

export function analyzeCv(text, signal) {
  return request("cv/analyze", { method: "POST", body: { text }, signal });
}
