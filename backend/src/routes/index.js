import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { cvRouter } from "./cv.routes.js";
import { llmKeysRouter } from "./llm-keys.routes.js";
import { analysesRouter } from "./analyses.routes.js";
import { skillsRouter } from "./skills.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/cv", cvRouter);
apiRouter.use("/llm-keys", llmKeysRouter);
apiRouter.use("/analyses", analysesRouter);
apiRouter.use("/skills", skillsRouter);
