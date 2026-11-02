/** Visibly marked slot for information still to be supplied. Never presented as fact. */
export function Placeholder({ label, tone = 'light' }: { label: string; tone?: 'light' | 'dark' }) {
  const colors = tone === 'dark' ? 'border-white/25 text-white/50' : 'border-navy/25 text-muted';
  return <span className={`inline-block border-b border-dashed pb-0.5 text-sm italic ${colors}`}>To be added: {label}</span>;
}
