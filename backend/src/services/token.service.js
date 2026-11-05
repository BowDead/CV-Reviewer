import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH_TOKEN_TTL_SECONDS } from "../config/auth.js";

export function signAuthToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user.id,
    expiresIn: AUTH_TOKEN_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyAuthToken(token) {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  return { id: payload.sub, role: payload.role };
}
