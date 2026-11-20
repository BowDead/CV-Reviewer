import { AUTH_COOKIE_NAME } from "../config/auth.js";
import { HttpError } from "../errors/HttpError.js";
import { findBlockState } from "../models/user.model.js";
import { verifyAuthToken } from "../services/token.service.js";

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return next(new HttpError(401, "AUTH_REQUIRED"));
  }

  let user;
  try {
    user = verifyAuthToken(token);
  } catch {
    return next(new HttpError(401, "SESSION_EXPIRED"));
  }

  const blocked = await findBlockState(user.id);
  if (blocked === null) {
    return next(new HttpError(401, "SESSION_EXPIRED"));
  }
  if (blocked) {
    return next(new HttpError(403, "ACCOUNT_BLOCKED"));
  }
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new HttpError(403, "FORBIDDEN"));
    }
    next();
  };
}
