/**
 * Vercel serverless entry point. The whole Express app (website shell with SEO,
 * API, sitemap, dashboard API) runs as one function; Vercel serves the built
 * static assets itself and rewrites every other request here (see /vercel.json).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app';
import { connectDatabase } from './db';
import { logger } from './logger';

const app = createApp();

// One connection per warm function instance, reused across invocations.
let ready: Promise<void> | undefined;
async function connectOnce() {
  if (!ready) {
    ready = (async () => {
      await connectDatabase();
      // Production disables autoIndex; make sure declared indexes exist (idempotent).
      await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()));
    })().catch((err) => {
      ready = undefined; // retry on the next request instead of caching the failure
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await connectOnce();
  } catch (err) {
    logger.error({ err }, 'database connection failed');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'The service is temporarily unavailable. Please try again shortly.' }));
    return;
  }
  return app(req as never, res as never);
}
