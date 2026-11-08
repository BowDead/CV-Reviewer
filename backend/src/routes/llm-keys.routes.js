import { Router } from "express";
import {
  deleteKey,
  getKeys,
  postKey,
  putKeyOrder,
} from "../controllers/llm-key.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const llmKeysRouter = Router();

llmKeysRouter.use(requireAuth);

llmKeysRouter.get("/", getKeys);
llmKeysRouter.post("/", postKey);
llmKeysRouter.put("/order", putKeyOrder);
llmKeysRouter.delete("/:id", deleteKey);
