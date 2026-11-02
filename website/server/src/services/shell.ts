import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import { PUBLIC_PAGES, productDetail, publicContent, siteData, type PublicPage } from './catalog';
import { VARIANT_WIDTHS } from './media';

/**
 * Speeds up the first page view. For every page request the HTML shell gets:
 * - the page's API data embedded as inert JSON, so the app renders without waiting on API calls;
 * - a high-priority preload for the largest image (hero poster or product image);
 * - modulepreload links for the route's JavaScript chunk (from Vite's build manifest),
 *   so it downloads in parallel with the main bundle instead of after it.
 */

interface ManifestChunk {
  file: string;
  imports?: string[];
}
type Manifest = Record<string, ManifestChunk>;

let manifest: Manifest | null | undefined;
function getManifest(): Manifest | null {
  if (manifest === undefined) {
    const file = path.join(config.CLIENT_DIST, '.vite', 'manifest.json');
    manifest = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Manifest) : null;
  }
  return manifest;
}

const ROUTES: { match: RegExp; page?: PublicPage; module: string }[] = [
  { match: /^\/$/, page: 'home', module: 'src/pages/Home.tsx' },
  { match: /^\/about$/, page: 'about', module: 'src/pages/About.tsx' },
  { match: /^\/products$/, page: 'products', module: 'src/pages/Products.tsx' },
  { match: /^\/products\/[a-z0-9-]{1,80}$/, module: 'src/pages/ProductDetail.tsx' },
  { match: /^\/infrastructure$/, page: 'infrastructure', module: 'src/pages/Infrastructure.tsx' },
  { match: /^\/quality$/, page: 'quality', module: 'src/pages/Quality.tsx' },
  { match: /^\/contact$/, page: 'contact', module: 'src/pages/Contact.tsx' },
  { match: /^\/request-quote$/, module: 'src/pages/RequestQuote.tsx' },
];

function chunkFiles(key: string, m: Manifest, seen = new Set<string>()): string[] {
  const chunk = m[key];
  if (!chunk || seen.has(key)) return [];
  seen.add(key);
  return [chunk.file, ...(chunk.imports ?? []).flatMap((k) => chunkFiles(k, m, seen))];
}

/** JSON that is safe inside a <script> element. */
const BACKSLASH = String.fromCharCode(92);
// '<' could close the element; U+2028/U+2029 are line terminators in older JS engines.
const UNSAFE_IN_SCRIPT = new Set([0x3c, 0x2028, 0x2029]);
const scriptJson = (v: unknown) =>
  Array.from(JSON.stringify(v), (ch) => {
    const code = ch.charCodeAt(0);
    return UNSAFE_IN_SCRIPT.has(code) ? `${BACKSLASH}u${code.toString(16).padStart(4, '0')}` : ch;
  }).join('');

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function imagePreload(url: string): string {
  if (!/^(\/|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/)(uploads|media\/products)\/.+\.webp$/.test(url)) return url ? `<link rel="preload" as="image" href="${esc(url)}" fetchpriority="high">` : '';
  const base = url.slice(0, -'.webp'.length);
  const set = VARIANT_WIDTHS.map((w) => `${base}-${w}.avif ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${esc(set)}" imagesizes="(min-width: 1024px) 50vw, 100vw" fetchpriority="high">`;
}

export async function shellExtras(rawPath: string): Promise<{ head: string; body: string }> {
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  const route = ROUTES.find((r) => r.match.test(pathname));
  if (!route) return { head: '', body: '' };

  const data: Record<string, unknown> = { '/api/site': await siteData() };
  const head: string[] = [];

  if (route.page && PUBLIC_PAGES.includes(route.page)) {
    data[`/api/content/${route.page}`] = await publicContent(route.page);
  }
  if (route.page === 'home') {
    head.push('<link rel="preload" as="image" type="image/webp" imagesrcset="/media/hero/hero-poster-960.webp 960w, /media/hero/hero-poster.webp 1920w" imagesizes="100vw" fetchpriority="high">');
  }
  if (route.module.endsWith('ProductDetail.tsx')) {
    const slug = pathname.split('/')[2];
    const product = await productDetail(slug);
    if (product) {
      data[`/api/products/${slug}`] = product;
      head.push(imagePreload(product.image?.url ?? ''));
    }
  }

  const m = getManifest();
  if (m) for (const file of new Set(chunkFiles(route.module, m))) head.push(`<link rel="modulepreload" href="/${file}">`);

  return {
    head: head.filter(Boolean).join('\n    '),
    body: `<script type="application/json" id="__ARIZEN_DATA__">${scriptJson(data)}</script>`,
  };
}
