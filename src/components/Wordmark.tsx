/** Typographic Neureonix mark used across the proposal (no official logo supplied). */
export function NeureonixMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true" fill="none">
        <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2.4" fill="#51C7D9" />
      </svg>
      <span className="font-display text-[0.8rem] font-bold tracking-[0.32em]">NEUREONIX</span>
    </span>
  );
}
