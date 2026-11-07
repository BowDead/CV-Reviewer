export class ApiError extends Error {
  constructor(status, code, params = {}) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.params = params;
  }
}

export async function request(path, { method = "GET", body, signal } = {}) {
  const isFormData = body instanceof FormData;

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers:
        body && !isFormData
          ? { "Content-Type": "application/json" }
          : undefined,
      body: body && !isFormData ? JSON.stringify(body) : body,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data?.error
      ? new ApiError(response.status, data.error, data.params)
      : new ApiError(response.status, "HTTP_ERROR", {
          status: response.status,
        });
  }

  return data;
}
