import { useEffect, useState, type CSSProperties } from 'react';
import { useRouteLoaderData } from 'react-router';
import type { SiteData } from './types';

/** Site data when available; undefined if the root loader failed (used by error pages). */
export function useOptionalSite(): SiteData | undefined {
  return useRouteLoaderData('root') as SiteData | undefined;
}

/** Site-wide data (settings, navigation, footer, catalogue index) loaded once by the root route. */
export function useSite(): SiteData {
  const data = useRouteLoaderData('root') as SiteData | undefined;
  if (!data) throw new Error('useSite must be used inside the public site routes');
  return data;
}

export function useScrolledPast(px: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > px);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [px]);
  return past;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** A product's signature colour as the `--accent` CSS variable (unset falls back to the site colours). */
export function accentVars(accent: string | undefined): CSSProperties | undefined {
  return accent ? ({ '--accent': accent } as CSSProperties) : undefined;
}
