import { useSite } from '../../lib/site';
import { Img } from '../ui/Img';

/**
 * Uses the official logo once uploaded in Settings; until then an original
 * typographic wordmark stands in (it is not Arizen's registered mark).
 */
export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const { settings } = useSite();
  if (settings.logo.url) {
    return <Img src={settings.logo.url} alt={settings.logo.alt || settings.companyName} priority className={`h-9 w-auto ${className}`} />;
  }
  const ink = tone === 'light' ? 'text-white' : 'text-navy';
  return (
    <span className={`inline-flex items-center gap-3 ${ink} ${className}`}>
      <svg viewBox="0 0 28 28" className="h-7 w-7 shrink-0" aria-hidden="true" fill="none">
        <path d="M14 2.5l9.96 5.75v11.5L14 25.5l-9.96-5.75V8.25z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 8.5l4.76 2.75v5.5L14 19.5l-4.76-2.75v-5.5z" stroke="#47C5D3" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="1.8" fill="currentColor" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-extrabold tracking-[0.2em]">ARIZEN</span>
        <span className="mt-1 font-display text-[0.55rem] font-semibold tracking-[0.42em] opacity-70">POLYMERS</span>
      </span>
    </span>
  );
}
