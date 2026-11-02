import { motion } from 'framer-motion';
import { easePremium } from './motion/Reveal';

const R = 150;
const C = 200;

/**
 * The circular economy as Arizen describes it: recoverable plastic is reprocessed
 * into granules that manufacturers turn back into products. The ring draws in,
 * then a marker keeps circling (still under reduced motion).
 */
export function CircularLoop({ stages, className = '' }: { stages: string[]; className?: string }) {
  const n = stages.length;
  const at = (i: number, r = R) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
  };
  return (
    <figure className={className}>
      <svg viewBox="0 0 400 400" className="h-auto w-full overflow-visible" role="img" aria-label={`Circular economy: ${stages.join(', then ')}, and back again`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="18" />
        <motion.circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--color-leaf)"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(-90 ${C} ${C})`}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 2, ease: easePremium }}
        />
        {/* Direction arrows between stages */}
        {stages.map((_, i) => {
          const a = ((i + 0.5) / n) * 360 - 90;
          const p = at(i + 0.5);
          return <path key={`arrow-${i}`} d="M-6 -7 L6 0 L-6 7" fill="none" stroke="var(--color-leaf)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${p.x} ${p.y}) rotate(${a + 90})`} />;
        })}
        <g className="origin-center animate-[spin_14s_linear_infinite] motion-reduce:animate-none" style={{ transformBox: 'view-box' }}>
          <circle cx={C} cy={C - R} r="7" fill="var(--color-leaf-bright)" stroke="white" strokeWidth="3" />
        </g>
        {stages.map((s, i) => {
          const p = at(i);
          return (
            <motion.g key={s} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.25, duration: 0.6, ease: easePremium }} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
              <circle cx={p.x} cy={p.y} r="44" fill="white" stroke="var(--color-leaf)" strokeWidth="2" />
              <text x={p.x} y={p.y - 6} textAnchor="middle" className="fill-[var(--color-leaf)] font-display text-[11px] font-bold tracking-[0.18em]">
                {String(i + 1).padStart(2, '0')}
              </text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" className="fill-navy font-display text-[13px] font-bold">
                {s}
              </text>
            </motion.g>
          );
        })}
        <text x={C} y={C - 4} textAnchor="middle" className="fill-navy font-display text-[20px] font-extrabold tracking-tight">
          Circular
        </text>
        <text x={C} y={C + 20} textAnchor="middle" className="fill-navy font-display text-[20px] font-extrabold tracking-tight">
          economy
        </text>
      </svg>
    </figure>
  );
}
