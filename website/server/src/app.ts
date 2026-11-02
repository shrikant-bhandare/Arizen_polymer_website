import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { logger } from './logger';
import { requireAuth, requireCsrf, requireRole } from './middleware/auth';
import { apiNotFound, errorHandler } from './middleware/errors';
import { apiLimiter, requireJson, securityHeaders } from './middleware/security';
import { authRouter } from './routes/admin/auth';
import { categoriesRouter, productsRouter } from './routes/admin/catalog';
import { inquiriesRouter } from './routes/admin/inquiries';
import { mediaRouter } from './routes/admin/media';
import { contentRouter, dashboardRouter, settingsRouter } from './routes/admin/site';
import { usersRouter } from './routes/admin/users';
import { publicRouter } from './routes/public';
import { renderIndexHtml, robotsTxt, sitemapXml } from './services/seo';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => !req.url?.startsWith('/api') },
      // Compact access logs: no headers (and so no cookies) are ever written.
      serializers: { req: (req) => ({ method: req.method, url: req.url }), res: (res) => ({ status: res.statusCode }) },
    }),
  );
  app.use(securityHeaders);
  app.use(compression());
  app.use(cookieParser());
  if (config.CORS_ORIGINS.length) app.use('/api', cors({ origin: config.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  /* ---------------------------------------------------------------- API */
  const api = Router();
  api.use(apiLimiter);
  api.get('/health', (_req, res) => {
    const db = mongoose.connection.readyState === 1;
    res.status(db ? 200 : 503).json({ ok: db });
  });
  api.use(publicRouter);

  const admin = Router();
  admin.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  admin.use('/auth', authRouter);
  admin.use(requireAuth, requireCsrf);
  admin.use('/media', mediaRouter); // multipart uploads, so mounted before the JSON-only guard
  admin.use(requireJson);
  admin.use('/dashboard', dashboardRouter);
  admin.use('/products', productsRouter);
  admin.use('/categories', categoriesRouter);
  admin.use('/content', contentRouter);
  admin.use('/inquiries', inquiriesRouter);
  admin.use('/settings', settingsRouter);
  admin.use('/users', requireRole('admin'), usersRouter);
  api.use('/admin', admin);
  api.use(apiNotFound);
  app.use('/api', api);

  /* ---------------------------------------------------------------- Files */
  app.use('/uploads', express.static(config.UPLOAD_DIR, { maxAge: '365d', immutable: true, index: false, dotfiles: 'deny', fallthrough: false }));

  app.get('/sitemap.xml', async (_req, res) => {
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(await sitemapXml());
  });
  app.get('/robots.txt', async (_req, res) => {
    res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(await robotsTxt());
  });

  /* ---------------------------------------------------------------- Website */
  // On Vercel the shell is renamed to app-shell.html so the CDN never serves it
  // un-rendered; every other host keeps index.html.
  const indexFile = ['index.html', 'app-shell.html'].map((f) => path.join(config.CLIENT_DIST, f)).find((f) => existsSync(f)) ?? path.join(config.CLIENT_DIST, 'index.html');
  if (existsSync(indexFile)) {
    const template = readFileSync(indexFile, 'utf8');
    app.use(
      express.static(config.CLIENT_DIST, {
        index: false,
        setHeaders: (res, file) => {
          // Hashed build assets never change; everything else revalidates hourly.
          res.setHeader('Cache-Control', file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
        },
      }),
    );
    // Every page route returns the app shell with its own title, description, canonical URL and structured data.
    app.get('/{*path}', async (req, res, next) => {
      if (path.extname(req.path)) return next();
      const { status, html } = await renderIndexHtml(template, req.path);
      res.status(status).set('Cache-Control', 'no-cache').type('html').send(html);
    });
  } else if (!config.isTest) {
    logger.warn({ indexFile }, 'client build not found; serving the API only (use the Vite dev server for the website)');
  }

  app.use((_req, res) => {
    res.status(404).type('text/plain').send('Not found');
  });
  app.use(errorHandler);
  return app;
}
