import { Router } from 'express';
import { healthRouter } from './features/health/health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);