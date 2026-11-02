/**
 * Vercel serverless entry point. The whole Express app (website shell with SEO,
 * API, sitemap, dashboard API) runs as one function; Vercel serves the built
 * static assets itself and rewrites every other request here (see /vercel.json).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import mongoose from 'mongoose';

type Listener = (req: IncomingMessage, res: ServerResponse) => void;

// The app (and its configuration) loads on the first request rather than at import, so a
// missing environment variable shows a readable message instead of Vercel's opaque
// FUNCTION_INVOCATION_FAILED page.
let appReady: Promise<Listener> | undefined;
function loadApp() {
  appReady ??= import('./app').then(({ createApp }) => createApp() as unknown as Listener);
  return appReady;
}

// One connection per warm function instance, reused across invocations.
let dbReady: Promise<void> | undefined;
async function connectOnce() {
  if (!dbReady) {
    dbReady = (async () => {
      const { connectDatabase } = await import('./db');
      await connectDatabase();
      // Production disables autoIndex; make sure declared indexes exist (idempotent).
      await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()));
    })().catch((err) => {
      dbReady = undefined; // retry on the next request instead of caching the failure
      throw err;
    });
  }
  return dbReady;
}

function fail(res: ServerResponse, status: number, message: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(message);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let app: Listener;
  try {
    app = await loadApp();
  } catch (err) {
    console.error('[startup] configuration error', err);
    // Configuration messages name the missing setting only, never its value.
    return fail(res, 500, `Website configuration error: ${err instanceof Error ? err.message : 'see the function logs'}\nSet it in Vercel (Settings, Environment Variables), then redeploy.`);
  }
  try {
    await connectOnce();
  } catch (err) {
    const { logger } = await import('./logger');
    logger.error({ err }, 'database connection failed');
    return fail(res, 503, 'The service is temporarily unavailable. Please try again shortly.');
  }
  return app(req, res);
}
