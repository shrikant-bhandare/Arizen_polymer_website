import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, put } from '@vercel/blob';
import sharp, { type Metadata } from 'sharp';
import { config } from '../config';
import { HttpError } from '../middleware/errors';
import { Product, ProductCategory } from '../models/catalog';
import { MediaAsset, SiteSettings, WebsiteContent } from '../models/site';

export const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif']);
/** Responsive widths. The public <Img> component builds srcsets from this same list. */
export const VARIANT_WIDTHS = [480, 960, 1600] as const;
const MASTER_MAX = 2400;

/**
 * Where image files live. With BLOB_READ_WRITE_TOKEN set (Vercel), files go to
 * Vercel Blob storage; otherwise to UPLOAD_DIR on disk. Names are deterministic
 * (no random suffix) so the <Img> component can derive the responsive sizes.
 */
const useBlob = () => Boolean(config.BLOB_READ_WRITE_TOKEN);
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/uploads\//;

async function saveFile(rel: string, data: Buffer, contentType: string): Promise<string> {
  if (useBlob()) {
    const { url } = await put(`uploads/${rel}`, data, { access: 'public', contentType, addRandomSuffix: false, cacheControlMaxAge: 31_536_000, token: config.BLOB_READ_WRITE_TOKEN });
    return url;
  }
  const abs = path.join(config.UPLOAD_DIR, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, data);
  return `/uploads/${rel}`;
}

/**
 * Re-encodes an uploaded image: verifies it really is an image (by decoding it,
 * not by trusting the declared type), applies EXIF rotation, strips metadata
 * (including location data), and writes a WebP master plus WebP and AVIF variants.
 */
export async function storeImage(buffer: Buffer, originalName: string, uploadedBy: string) {
  let meta: Metadata;
  try {
    meta = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new HttpError(400, 'The file is not a valid image.');
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format) || !meta.width || !meta.height) {
    throw new HttpError(400, 'Only JPEG, PNG, WebP and AVIF images are accepted.');
  }

  const now = new Date();
  const dir = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const id = randomUUID();

  const base = () => sharp(buffer, { limitInputPixels: 40_000_000 }).rotate();
  const master = await base().resize({ width: MASTER_MAX, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const url = await saveFile(`${dir}/${id}.webp`, master.data, 'image/webp');

  const variants: { width: number; format: string; url: string; size: number }[] = [];
  for (const width of VARIANT_WIDTHS) {
    for (const format of ['webp', 'avif'] as const) {
      const pipeline = base().resize({ width, withoutEnlargement: true });
      const out = await (format === 'webp' ? pipeline.webp({ quality: 80 }) : pipeline.avif({ quality: 55, effort: 4 })).toBuffer();
      const variantUrl = await saveFile(`${dir}/${id}-${width}.${format}`, out, `image/${format}`);
      variants.push({ width, format, url: variantUrl, size: out.length });
    }
  }

  return MediaAsset.create({
    url,
    originalName: path.basename(originalName).slice(0, 200),
    mime: 'image/webp',
    size: master.data.length,
    width: master.info.width,
    height: master.info.height,
    variants,
    uploadedBy,
  });
}

/** Where an image URL is referenced, so editors are warned before deleting something in use. */
export async function findMediaUsage(url: string): Promise<string[]> {
  const usage: string[] = [];
  const needle = JSON.stringify(url);
  const [products, categories, content, settings] = await Promise.all([
    Product.find({}, { name: 1, image: 1, gallery: 1, seo: 1 }).lean(),
    ProductCategory.find({}, { name: 1, image: 1 }).lean(),
    WebsiteContent.find({}, { key: 1, data: 1 }).lean(),
    SiteSettings.findOne({ key: 'site' }, { defaultSeo: 1 }).lean(),
  ]);
  for (const p of products) if (JSON.stringify(p).includes(needle)) usage.push(`Product: ${p.name}`);
  for (const c of categories) if (JSON.stringify(c).includes(needle)) usage.push(`Category: ${c.name}`);
  for (const c of content) if (JSON.stringify(c.data).includes(needle)) usage.push(`Page content: ${c.key}`);
  if (settings && JSON.stringify(settings).includes(needle)) usage.push('Site settings');
  return usage;
}

export async function deleteImageFiles(asset: { url: string; variants: { url?: string | null }[] }) {
  const toPath = (url: string) => {
    const rel = url.replace(/^\/uploads\//, '');
    const abs = path.resolve(config.UPLOAD_DIR, rel);
    // Never touch anything outside the upload directory.
    if (!abs.startsWith(path.resolve(config.UPLOAD_DIR) + path.sep)) throw new HttpError(400, 'Invalid media path');
    return abs;
  };
  const urls = [asset.url, ...asset.variants.map((v) => v.url).filter((u): u is string => !!u)];
  const blobs = urls.filter((u) => BLOB_URL.test(u));
  if (blobs.length) await del(blobs, { token: config.BLOB_READ_WRITE_TOKEN });
  await Promise.all(urls.filter((u) => u.startsWith('/uploads/')).map((u) => rm(toPath(u), { force: true })));
}
