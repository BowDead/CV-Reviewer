import { Router } from "express";
import {
  getMe,
  postLogin,
  postLogout,
  postRegister,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", postRegister);
authRouter.post("/login", postLogin);
authRouter.post("/logout", postLogout);
authRouter.get("/me", requireAuth, getMe);
