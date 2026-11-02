import { useSite } from '../../lib/site';

interface PendingProps {
  /** What Arizen still needs to supply, e.g. "Vision statement". */
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * A clearly marked slot for content Arizen has not supplied yet. Never presented
 * as fact. Hidden entirely when "Show placeholders" is switched off in Settings.
 */
export function Pending({ label, tone = 'light', className = '' }: PendingProps) {
  const { settings } = useSite();
  if (!settings.showPlaceholders) return null;
  const colors = tone === 'dark' ? 'border-white/20 text-white/65' : 'border-navy/20 text-muted';
  return (
    <div className={`border border-dashed px-5 py-4 ${colors} ${className}`} role="note">
      <p className="eyebrow text-[0.6rem]">To be provided by Arizen</p>
      <p className="mt-1.5 text-sm">{label}</p>
    </div>
  );
}

/** Small label shown on illustrations that do not depict Arizen's actual premises. */
export function ConceptualNote({ tone = 'light', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[0.7rem] tracking-wide ${tone === 'dark' ? 'text-white/65' : 'text-muted'} ${className}`}>
      <span className="h-px w-4 bg-current" aria-hidden="true" />
      Conceptual illustration, not Arizen’s premises
    </span>
  );
}
