import { Router } from 'express';
import { contentKeys, contentPages, contentSchemas, type ContentKey } from '../../../../shared/content';
import { siteSettingsInput } from '../../../../shared/schemas';
import { notFound } from '../../middleware/errors';
import { Product, ProductCategory } from '../../models/catalog';
import { Inquiry } from '../../models/Inquiry';
import { SiteSettings, WebsiteContent } from '../../models/site';
import { getContent, getContentMeta, getSettings } from '../../services/content';

/* ------------------------------------------------------------------ Content */

export const contentRouter = Router();

contentRouter.get('/', async (_req, res) => {
  const meta = await getContentMeta();
  res.json(meta.map((m) => ({ ...m, label: contentPages[m.key].label, path: contentPages[m.key].path })));
});

contentRouter.get('/:key', async (req, res) => {
  const key = req.params.key as ContentKey;
  if (!contentKeys.includes(key)) throw notFound('Page');
  res.json(await getContent(key));
});

contentRouter.put('/:key', async (req, res) => {
  const key = req.params.key as ContentKey;
  if (!contentKeys.includes(key)) throw notFound('Page');
  const data = contentSchemas[key].parse(req.body);
  await WebsiteContent.updateOne({ key }, { $set: { data, updatedBy: req.user!.name } }, { upsert: true });
  res.json(data);
});

/* ------------------------------------------------------------------ Settings */

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res) => {
  res.json(await getSettings());
});

settingsRouter.put('/', async (req, res) => {
  const input = siteSettingsInput.parse(req.body);
  // Only administrators decide who receives inquiry emails.
  if (req.user!.role !== 'admin') input.notificationEmails = (await getSettings()).notificationEmails;
  await SiteSettings.updateOne({ key: 'site' }, { $set: input }, { upsert: true });
  res.json(await getSettings());
});

/* ------------------------------------------------------------------ Dashboard */

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res) => {
  const [totalProducts, publishedProducts, activeCategories, totalInquiries, newInquiries, recentInquiries, content, products, categories] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'published' }),
    ProductCategory.countDocuments({ isActive: true }),
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
    Inquiry.find({}, { fullName: 1, companyName: 1, productName: 1, status: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(6).lean(),
    WebsiteContent.find({}, { key: 1, updatedAt: 1, updatedBy: 1 }).sort({ updatedAt: -1 }).limit(6).lean(),
    Product.find({}, { name: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).limit(6).lean(),
    ProductCategory.find({}, { name: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).limit(6).lean(),
  ]);

  const recentUpdates = [
    ...content.map((c) => ({ type: 'Page', label: contentPages[c.key as ContentKey]?.label ?? c.key, href: `/admin/content/${c.key}`, updatedAt: c.updatedAt, by: c.updatedBy })),
    ...products.map((p) => ({ type: 'Product', label: p.name, href: `/admin/products/${p._id}`, updatedAt: p.updatedAt, by: '' })),
    ...categories.map((c) => ({ type: 'Category', label: c.name, href: '/admin/categories', updatedAt: c.updatedAt, by: '' })),
  ]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 8);

  res.json({ totalProducts, publishedProducts, activeCategories, totalInquiries, newInquiries, recentInquiries, recentUpdates });
});
