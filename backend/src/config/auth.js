import { env } from "./env.js";

export const AUTH_COOKIE_NAME = "cvr_session";

export const AUTH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProduction,
  path: "/",
  maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
};
