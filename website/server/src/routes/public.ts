import { Router } from 'express';
import { z } from 'zod';
import { inquiryGuard, inquiryInput, SLUG_PATTERN } from '../../../shared/schemas';
import { logger } from '../logger';
import { HttpError, notFound } from '../middleware/errors';
import { inquiryLimiter, requireJson } from '../middleware/security';
import { Product, ProductCategory } from '../models/catalog';
import { Inquiry } from '../models/Inquiry';
import { PUBLIC_PAGES, productCard, productDetail, publicContent, siteData, type PublicPage } from '../services/catalog';
import { notifyNewInquiry } from '../services/email';

export const publicRouter = Router();

const slugParam = z.string().regex(SLUG_PATTERN).max(80);

/** Everything the site shell needs on every page: company details, navigation, footer, catalogue index. */
publicRouter.get('/site', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await siteData());
});

publicRouter.get('/content/:key', async (req, res) => {
  const key = req.params.key as PublicPage;
  if (!PUBLIC_PAGES.includes(key)) throw notFound('Page');
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await publicContent(key));
});

publicRouter.get('/products', async (req, res) => {
  const filter: Record<string, unknown> = { status: 'published' };
  if (typeof req.query.category === 'string' && req.query.category) {
    const category = await ProductCategory.findOne({ slug: slugParam.parse(req.query.category), isActive: true }).lean();
    if (!category) throw notFound('Category');
    filter.category = category._id;
  }
  const products = await Product.find(filter, productCard).sort({ order: 1, name: 1 }).lean();
  res.set('Cache-Control', 'public, max-age=60');
  res.json(products);
});

publicRouter.get('/products/:slug', async (req, res) => {
  const slug = slugParam.safeParse(req.params.slug);
  const product = slug.success ? await productDetail(slug.data) : null;
  if (!product) throw notFound('Product');
  res.set('Cache-Control', 'public, max-age=60');
  res.json(product);
});

const MIN_HUMAN_MS = 2500;

publicRouter.post('/inquiries', inquiryLimiter, requireJson, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const guard = inquiryGuard.safeParse({ website: body.website ?? '', elapsedMs: body.elapsedMs });
  const { website: _w, elapsedMs: _e, ...fields } = body;
  void _w;
  void _e;
  const input = inquiryInput.parse(fields);

  // Bots get the same response as people, so they learn nothing, but nothing is stored or sent.
  if (!guard.success || (guard.data.elapsedMs !== undefined && guard.data.elapsedMs < MIN_HUMAN_MS)) {
    logger.info({ reason: guard.success ? 'too-fast' : 'honeypot' }, 'inquiry discarded as spam');
    res.status(201).json({ ok: true, reference: 'RECEIVED' });
    return;
  }

  let product = null;
  if (input.product) {
    const slug = slugParam.safeParse(input.product);
    if (!slug.success) throw new HttpError(400, 'Unknown product.', { issues: [{ path: 'product', message: 'Please choose a product from the list' }] });
    product = await Product.findOne({ slug: slug.data, status: 'published' }, { name: 1 }).lean();
    if (!product) throw new HttpError(400, 'Unknown product.', { issues: [{ path: 'product', message: 'Please choose a product from the list' }] });
  }

  const inquiry = await Inquiry.create({
    ...input,
    product: product?._id ?? null,
    productName: product?.name ?? '',
    sourcePath: String(req.get('referer') ?? '').slice(0, 300),
    userAgent: String(req.get('user-agent') ?? '').slice(0, 300),
  });

  // Respond immediately; email delivery is recorded on the inquiry for the dashboard.
  notifyNewInquiry(inquiry.toObject()).catch((err) => logger.error({ err }, 'notification task failed'));
  res.status(201).json({ ok: true, reference: String(inquiry._id).slice(-6).toUpperCase() });
});
