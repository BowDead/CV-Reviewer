import { HttpError } from "../errors/HttpError.js";

function genericCodeFor(status) {
  if (status === 413) {
    return "PAYLOAD_TOO_LARGE";
  }
  return status < 500 ? "INVALID_INPUT" : "INTERNAL_ERROR";
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
  }

  if (err instanceof HttpError) {
    return res.status(status).json({ error: err.code, params: err.params });
  }

  res.status(status).json({ error: genericCodeFor(status) });
}
