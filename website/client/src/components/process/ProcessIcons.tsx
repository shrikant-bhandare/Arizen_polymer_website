import { useId, type ReactNode } from 'react';

export type ProcessIconKey = 'raw' | 'blend' | 'extrude' | 'cool' | 'pelletise' | 'test' | 'pack';

/**
 * Line pictograms for the production-line flow. Moving parts carry `pi-part`
 * classes (styles.css) and only run while the station is active.
 */
export function ProcessIcon({ name, className = '' }: { name: ProcessIconKey | undefined; className?: string }) {
  const clip = useId();
  const shapes: Record<ProcessIconKey, ReactNode> = {
    raw: (
      <>
        <path d="M9 16h30l-9 13v9H18v-9z" />
        <path d="M18 38h12" />
        <g className="pi-part pi-fall">
          <circle cx="20" cy="5" r="1.7" fill="currentColor" stroke="none" />
        </g>
        <g className="pi-part pi-fall" style={{ animationDelay: '-0.4s' }}>
          <circle cx="25" cy="5" r="1.7" fill="currentColor" stroke="none" />
        </g>
        <g className="pi-part pi-fall" style={{ animationDelay: '-0.8s' }}>
          <circle cx="29" cy="5" r="1.7" fill="currentColor" stroke="none" />
        </g>
      </>
    ),
    blend: (
      <>
        <circle cx="24" cy="24" r="15" />
        <path d="M14 42h20" />
        <g className="pi-part pi-rotate">
          <path d="M24 13v22M13 24h22" />
          <circle cx="24" cy="24" r="2.6" />
        </g>
      </>
    ),
    extrude: (
      <>
        <path d="M12 18l-3-7h10l-3 7" />
        <rect x="4" y="18" width="34" height="12" rx="2" />
        <path d="M38 21l6 2v2l-6 2" />
        <clipPath id={clip}>
          <rect x="5" y="19" width="32" height="10" />
        </clipPath>
        <g clipPath={`url(#${clip})`}>
          <g className="pi-part pi-slide">
            {[-2, 4, 10, 16, 22, 28, 34, 40].map((x) => (
              <path key={x} d={`M${x} 29l4-10`} />
            ))}
          </g>
        </g>
        <g className="pi-part pi-pulse">
          <path d="M22 14c1.2-1.4 1.2-2.6 0-4M28 14c1.2-1.4 1.2-2.6 0-4M34 14c1.2-1.4 1.2-2.6 0-4" />
        </g>
      </>
    ),
    cool: (
      <>
        <path d="M5 22v14h38V22" />
        <path d="M2 17c8 0 10 11 22 11s14-11 22-11" />
        <clipPath id={clip}>
          <rect x="6" y="22" width="36" height="13" />
        </clipPath>
        <g clipPath={`url(#${clip})`}>
          <g className="pi-part pi-wave">
            <path d="M-6 31q3-2.4 6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0" />
          </g>
        </g>
      </>
    ),
    pelletise: (
      <>
        <path d="M2 21h13" />
        <circle cx="25" cy="21" r="10" />
        <g className="pi-part pi-rotate-fast">
          <path d="M25 12v18M16 21h18M18.6 14.6l12.8 12.8M31.4 14.6L18.6 27.4" />
        </g>
        <g className="pi-part pi-drop">
          <rect x="23" y="34" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
        </g>
        <g className="pi-part pi-drop" style={{ animationDelay: '-0.5s' }}>
          <rect x="29" y="34" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
        </g>
        <path d="M14 44h22" />
      </>
    ),
    test: (
      <>
        <path d="M7 35a17 17 0 0 1 34 0" />
        <path d="M11.5 23l2.4 1.8M24 18v3M36.5 23l-2.4 1.8" />
        <g className="pi-part pi-swing">
          <path d="M24 35V22" />
        </g>
        <circle cx="24" cy="35" r="2.2" fill="currentColor" stroke="none" />
        <path d="M5 41h38" />
      </>
    ),
    pack: (
      <>
        <path d="M14 17h20l3 25H11z" />
        <path d="M18 17l2-5h8l2 5" />
        <rect x="19" y="27" width="10" height="7" rx="1" />
        <g className="pi-part pi-drop">
          <circle cx="24" cy="2" r="1.7" fill="currentColor" stroke="none" />
        </g>
      </>
    ),
  };

  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {name ? shapes[name] : <circle cx="24" cy="24" r="5" fill="currentColor" stroke="none" />}
    </svg>
  );
}
