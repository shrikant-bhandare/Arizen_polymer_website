import type { ContentKey, SeoFields } from '../../../shared/content';
import { config } from '../config';
import { Product } from '../models/catalog';
import { getContent, getSettings } from './content';
import { shellExtras } from './shell';

interface PageMeta {
  status: number;
  title: string;
  description: string;
  canonical: string;
  image: string;
  robots: string;
  type: 'website' | 'product';
  jsonLd: Record<string, unknown>[];
}

const STATIC_ROUTES: Record<string, { key?: ContentKey; title: string; crumb: string }> = {
  '/': { key: 'home', title: '', crumb: 'Home' },
  '/about': { key: 'about', title: 'About Us', crumb: 'About Us' },
  '/products': { key: 'products', title: 'Products', crumb: 'Products' },
  '/infrastructure': { key: 'infrastructure', title: 'Infrastructure', crumb: 'Infrastructure' },
  '/quality': { key: 'quality', title: 'Quality Control', crumb: 'Quality Control' },
  '/contact': { key: 'contact', title: 'Contact Us', crumb: 'Contact Us' },
  '/request-quote': { title: 'Request a Quote', crumb: 'Request a Quote' },
};

export const indexablePaths = Object.keys(STATIC_ROUTES);

const DEFAULT_OG = '/media/og-default.jpg';

async function baseUrl() {
  const settings = await getSettings();
  return { settings, origin: (settings.siteUrl || config.siteUrl).replace(/\/+$/, '') };
}

const absolute = (origin: string, url: string) => (/^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);

function organization(settings: Awaited<ReturnType<typeof getSettings>>, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: origin,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    ...(settings.social.length ? { sameAs: settings.social.map((s) => s.href).filter((h) => /^https?:/.test(h)) } : {}),
  };
}

function breadcrumbs(origin: string, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${origin}${t.path}` })),
  };
}

/** Resolves title, description, canonical URL, sharing image and structured data for a path. */
export async function metaForPath(rawPath: string): Promise<PageMeta> {
  const path = rawPath.replace(/\/+$/, '') || '/';
  const { settings, origin } = await baseUrl();
  const brand = settings.shortName;
  const fallbackImage = settings.defaultSeo.ogImage || DEFAULT_OG;
  const org = organization(settings, origin);

  const page = (title: string, seo: Partial<SeoFields>, description: string, trail: { name: string; path: string }[], extra: Record<string, unknown>[] = []): PageMeta => ({
    status: 200,
    title: seo.title || (title ? `${title} | ${brand}` : settings.defaultSeo.title || settings.companyName),
    description: seo.description || description || settings.defaultSeo.description,
    canonical: seo.canonical || `${origin}${path === '/' ? '/' : path}`,
    image: absolute(origin, seo.ogImage || fallbackImage),
    robots: 'index, follow',
    type: 'website',
    jsonLd: [org, ...(trail.length > 1 ? [breadcrumbs(origin, trail)] : []), ...extra],
  });

  if (path.startsWith('/admin')) {
    return { ...page('Admin', {}, '', []), robots: 'noindex, nofollow', jsonLd: [] };
  }

  const route = STATIC_ROUTES[path];
  if (route) {
    const content = route.key ? await getContent(route.key) : {};
    const seo = (content.seo ?? {}) as Partial<SeoFields>;
    const description = String((content.intro as string) ?? ((content.hero as { supporting?: string })?.supporting ?? ''));
    const trail = path === '/' ? [] : [{ name: 'Home', path: '/' }, { name: route.crumb, path }];
    const extra = path === '/' ? [{ '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName, url: origin }] : [];
    return page(route.title, seo, description, trail, extra);
  }

  const productMatch = /^\/products\/([a-z0-9-]{1,80})$/.exec(path);
  if (productMatch) {
    const product = await Product.findOne({ slug: productMatch[1], status: 'published' }).populate('category', 'name').lean();
    if (product) {
      const description = product.summary || product.description[0] || '';
      const image = product.image?.url || fallbackImage;
      const categoryName = (product.category as unknown as { name?: string } | null)?.name;
      const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description,
        image: absolute(origin, image),
        brand: { '@type': 'Brand', name: brand },
        ...(categoryName ? { category: categoryName } : {}),
      };
      const meta = page(`${product.name} (${product.code})`, { ...product.seo, ogImage: product.seo?.ogImage || image }, description, [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: product.name, path },
      ], [productLd]);
      return { ...meta, type: 'product' };
    }
  }

  return { ...page('Page not found', {}, '', []), status: 404, robots: 'noindex, follow', jsonLd: [] };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
/** JSON-LD inside <script> must not be able to close the tag. */
const jsonForScript = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

export function renderHead(meta: PageMeta, siteName: string): string {
  const tags = [
    `<meta name="description" content="${esc(meta.description)}" data-ssr-meta>`,
    `<meta name="robots" content="${meta.robots}" data-ssr-meta>`,
    `<link rel="canonical" href="${esc(meta.canonical)}" data-ssr-meta>`,
    `<meta property="og:type" content="${meta.type === 'product' ? 'product' : 'website'}" data-ssr-meta>`,
    `<meta property="og:site_name" content="${esc(siteName)}" data-ssr-meta>`,
    `<meta property="og:title" content="${esc(meta.title)}" data-ssr-meta>`,
    `<meta property="og:description" content="${esc(meta.description)}" data-ssr-meta>`,
    `<meta property="og:url" content="${esc(meta.canonical)}" data-ssr-meta>`,
    `<meta property="og:image" content="${esc(meta.image)}" data-ssr-meta>`,
    `<meta name="twitter:card" content="summary_large_image" data-ssr-meta>`,
    ...meta.jsonLd.map((ld) => `<script type="application/ld+json" data-ssr-meta>${jsonForScript(ld)}</script>`),
  ];
  return tags.join('\n    ');
}

export async function renderIndexHtml(template: string, path: string): Promise<{ status: number; html: string }> {
  const [meta, { settings }, extras] = await Promise.all([metaForPath(path), baseUrl(), shellExtras(path)]);
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace('<!--app-head-->', [renderHead(meta, settings.shortName), meta.status === 200 ? extras.head : ''].filter(Boolean).join('\n    '))
    .replace('</body>', `${meta.status === 200 ? extras.body : ''}</body>`);
  return { status: meta.status, html };
}

export async function sitemapXml(): Promise<string> {
  const { origin } = await baseUrl();
  const products = await Product.find({ status: 'published' }, { slug: 1, updatedAt: 1 }).lean();
  const urls = [
    ...indexablePaths.map((p) => ({ loc: `${origin}${p}`, lastmod: undefined as Date | undefined })),
    ...products.map((p) => ({ loc: `${origin}/products/${p.slug}`, lastmod: p.updatedAt })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;
}

export async function robotsTxt(): Promise<string> {
  const { origin } = await baseUrl();
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
}
