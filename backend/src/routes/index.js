import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { cvRouter } from "./cv.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/cv", cvRouter);
