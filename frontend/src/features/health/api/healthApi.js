import { request } from '@/shared/api/httpClient';

export function fetchHealth(signal) {
  return request('/health', { signal });
}