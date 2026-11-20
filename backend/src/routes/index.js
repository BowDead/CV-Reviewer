import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { cvRouter } from "./cv.routes.js";
import { llmKeysRouter } from "./llm-keys.routes.js";
import { analysesRouter } from "./analyses.routes.js";
import { skillsRouter } from "./skills.routes.js";
import { githubRouter } from "./github.routes.js";
import { offersRouter } from "./offers.routes.js";
import { profileRouter } from "./profile.routes.js";
import { positionsRouter } from "./positions.routes.js";
import { candidatesRouter } from "./candidates.routes.js";
import { invitationsRouter } from "./invitations.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/cv", cvRouter);
apiRouter.use("/llm-keys", llmKeysRouter);
apiRouter.use("/analyses", analysesRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/github", githubRouter);
apiRouter.use("/offers", offersRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/positions", positionsRouter);
apiRouter.use("/candidates", candidatesRouter);
apiRouter.use("/invitations", invitationsRouter);
