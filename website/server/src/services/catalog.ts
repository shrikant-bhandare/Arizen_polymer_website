import { trusted } from 'mongoose';
import type { ContentKey } from '../../../shared/content';
import { Product, ProductCategory } from '../models/catalog';
import { getContent, getPublicSettings } from './content';

/**
 * Public data, shared by the JSON API and by the HTML shell (which embeds the
 * same payloads so the first page renders without extra round trips).
 */

export const PUBLIC_PAGES = ['home', 'about', 'products', 'infrastructure', 'quality', 'contact'] as const satisfies ContentKey[];
export type PublicPage = (typeof PUBLIC_PAGES)[number];

export const productCard = { name: 1, code: 1, slug: 1, tagline: 1, summary: 1, image: 1, category: 1, order: 1 } as const;

export async function siteData() {
  const [settings, navigation, footer, categories, products] = await Promise.all([
    getPublicSettings(),
    getContent('navigation'),
    getContent('footer'),
    ProductCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
    Product.find({ status: 'published' }, productCard).sort({ order: 1, name: 1 }).lean(),
  ]);
  return { settings, navigation, footer, categories, products };
}

export async function publicContent(key: PublicPage) {
  const data = await getContent(key);
  if (key === 'quality') {
    // Only certifications Arizen has marked as verified ever reach the public site.
    const certs = data.certifications as { heading: string; items: { verified: boolean }[] };
    certs.items = certs.items.filter((c) => c.verified);
  }
  return data;
}

/** A published product with up to three related products, or null. */
export async function productDetail(slug: string) {
  const product = await Product.findOne({ slug, status: 'published' }).populate('category', 'name slug').lean();
  if (!product) return null;

  // Related: chosen by the editor first, then same category, then anything else published.
  // Operators built here from stored ids (not user input) are marked trusted for the injection guard.
  const chosen = await Product.find({ _id: trusted({ $in: product.relatedProducts }), status: 'published' }, productCard).lean();
  const extra =
    chosen.length < 3
      ? await Product.find({ _id: trusted({ $nin: [product._id, ...chosen.map((p) => p._id)] }), status: 'published' }, productCard)
          .sort({ order: 1 })
          .limit(12)
          .lean()
      : [];
  const categoryId = String((product.category as { _id?: unknown } | null)?._id ?? '');
  extra.sort((a, b) => Number(String(b.category) === categoryId) - Number(String(a.category) === categoryId));
  const related = [...chosen, ...extra].slice(0, 3);

  const { relatedProducts: _r, ...rest } = product;
  void _r;
  return { ...rest, related };
}
