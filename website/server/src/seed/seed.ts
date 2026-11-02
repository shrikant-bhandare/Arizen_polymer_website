import bcrypt from 'bcryptjs';
import type { Types } from 'mongoose';
import { contentKeys, contentSchemas } from '../../../shared/content';
import { passwordSchema, productInput } from '../../../shared/schemas';
import { logger } from '../logger';
import { AdminUser } from '../models/AdminUser';
import { Product, ProductCategory } from '../models/catalog';
import { SiteSettings, WebsiteContent } from '../models/site';
import { seedCategories, seedContent, seedProducts, seedSettings } from './data';

interface SeedOptions {
  /** Overwrite page content, settings and the seeded products (never touches inquiries, users or other products). */
  reset?: boolean;
  admin?: { name: string; email: string; password: string };
}

/**
 * Idempotent: running it again only fills in what is missing, so edits made in
 * the dashboard are preserved unless `reset` is passed.
 */
export async function seedDatabase({ reset = false, admin }: SeedOptions = {}) {
  const created: string[] = [];

  if (reset || !(await SiteSettings.exists({ key: 'site' }))) {
    await SiteSettings.updateOne({ key: 'site' }, { $set: seedSettings }, { upsert: true });
    created.push('site settings');
  }

  for (const key of contentKeys) {
    if (!reset && (await WebsiteContent.exists({ key }))) continue;
    const data = contentSchemas[key].parse(seedContent[key]);
    await WebsiteContent.updateOne({ key }, { $set: { data, updatedBy: 'Seed' } }, { upsert: true });
    created.push(`content: ${key}`);
  }

  const categoryIds = new Map<string, Types.ObjectId>();
  for (const c of seedCategories) {
    const doc = await ProductCategory.findOneAndUpdate({ slug: c.slug }, { $setOnInsert: c }, { upsert: true, returnDocument: 'after' });
    categoryIds.set(c.slug, doc._id);
  }

  for (const p of seedProducts) {
    const exists = await Product.exists({ slug: p.slug });
    if (exists && !reset) continue;
    // Validate exactly as the dashboard would, so seeded products can be edited and saved unchanged.
    const valid = productInput.parse({ ...p, category: String(categoryIds.get(p.category)) });
    if (exists) {
      await Product.updateOne({ slug: p.slug }, { $set: valid });
      created.push(`product reset: ${p.code}`);
    } else {
      await Product.create(valid);
      created.push(`product: ${p.code}`);
    }
  }

  if (admin && !(await AdminUser.exists({ role: 'admin' }))) {
    passwordSchema.parse(admin.password);
    await AdminUser.create({ name: admin.name, email: admin.email.toLowerCase(), role: 'admin', passwordHash: await bcrypt.hash(admin.password, 12) });
    created.push(`admin user: ${admin.email}`);
  }

  logger.info({ created }, created.length ? 'seed complete' : 'nothing to seed; database already populated');
  return created;
}
