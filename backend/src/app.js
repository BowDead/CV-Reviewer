import express from 'express';
import { apiRouter } from './routes.js';
import { notFound } from './shared/middleware/notFound.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}