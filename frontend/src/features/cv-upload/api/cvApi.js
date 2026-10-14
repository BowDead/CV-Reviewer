import { request } from "@/shared/api/httpClient";

export function parseCv(file, signal) {
  const body = new FormData();
  body.append("file", file);
  return request("/cv/parse", {
    method: "POST",
    body,
    signal,
  });
}
