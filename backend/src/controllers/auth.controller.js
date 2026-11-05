import { AUTH_COOKIE_NAME, authCookieOptions } from "../config/auth.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { signAuthToken } from "../services/token.service.js";
import { userView } from "../views/user.view.js";

function setAuthCookie(res, user) {
  res.cookie(AUTH_COOKIE_NAME, signAuthToken(user), authCookieOptions);
}

export async function postRegister(req, res) {
  const user = await registerUser(req.body);
  setAuthCookie(res, user);
  res.status(201).json({ user: userView(user) });
}

export async function postLogin(req, res) {
  const user = await loginUser(req.body);
  setAuthCookie(res, user);
  res.json({ user: userView(user) });
}

export function postLogout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.status(204).end();
}

export async function getMe(req, res) {
  const user = await getCurrentUser(req.user.id);
  res.json({ user: userView(user) });
}
