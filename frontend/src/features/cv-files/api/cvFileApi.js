import { request, requestBlob } from "@/shared/api/httpClient";

export function fetchCvFiles(signal) {
  return request("/cv/files", { signal });
}

export function fetchCvFileContent(id) {
  return requestBlob(`/cv/files/${id}/content`);
}

export function deleteCvFile(id) {
  return request(`/cv/files/${id}`, { method: "DELETE" });
}
