import { AUTH_COOKIE_NAME } from "../config/auth.js";
import { HttpError } from "../errors/HttpError.js";
import { verifyAuthToken } from "../services/token.service.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return next(new HttpError(401, "AUTH_REQUIRED"));
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    next(new HttpError(401, "SESSION_EXPIRED"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new HttpError(403, "FORBIDDEN"));
    }
    next();
  };
}
