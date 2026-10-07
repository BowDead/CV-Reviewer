export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  const isFormData = body instanceof FormData;

  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: body && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
    body: body && !isFormData ? JSON.stringify(body) : body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.error || `Błąd HTTP ${response.status}`);
  }

    return data;
}