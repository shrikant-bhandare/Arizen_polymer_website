import { useLocation } from 'react-router';
import type { SeoFields } from '@shared/content';
import { useOptionalSite } from '../../lib/site';

interface SeoProps {
  title?: string;
  description?: string;
  seo?: Partial<SeoFields>;
  image?: string;
  noindex?: boolean;
}

/**
 * Page title and meta tags for client-side navigation. The server renders the
 * same tags into the HTML for crawlers and link previews (server/src/services/seo.ts).
 */
export function Seo({ title, description, seo = {}, image, noindex }: SeoProps) {
  // Error pages can render before (or without) site data, so fall back to safe defaults.
  const settings = useOptionalSite()?.settings ?? { siteUrl: '', shortName: 'Arizen Polymers', companyName: 'Arizen Polymers India Private Limited', defaultSeo: { title: '', description: '', ogImage: '', canonical: '' } };
  const { pathname } = useLocation();
  const origin = (settings.siteUrl || window.location.origin).replace(/\/+$/, '');
  const fullTitle = seo.title || (title ? `${title} | ${settings.shortName}` : settings.defaultSeo.title || settings.companyName);
  const desc = seo.description || description || settings.defaultSeo.description;
  const canonical = seo.canonical || `${origin}${pathname}`;
  const ogImage = seo.ogImage || image || settings.defaultSeo.ogImage || '/media/og-default.jpg';
  const absImage = /^https?:/.test(ogImage) ? ogImage : `${origin}${ogImage}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absImage} />
    </>
  );
}
