import { motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { easePremium } from '../motion/Reveal';
import { ProcessIcon, type ProcessIconKey } from './ProcessIcons';

/** What the material looks like as it leaves a station. */
export type Material = 'resin' | 'blend' | 'melt' | 'strand' | 'pellet';

export interface FlowStep {
  title: string;
  text: string;
  icon?: ProcessIconKey;
  output?: Material;
}

/** Seconds the line spends on each station: a dwell, then the move to the next one. */
const STATION_SECONDS = 2;
const DWELL = 0.4;

const materialStyle: Record<Material, { width: number; height: number; borderRadius: number; backgroundColor: string; boxShadow: string }> = {
  resin: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#e5ebf0', boxShadow: '0 2px 6px rgba(0,0,0,0.35)' },
  blend: { width: 9, height: 9, borderRadius: 9, backgroundColor: '#9fd8e0', boxShadow: '0 2px 8px rgba(71,197,211,0.45)' },
  melt: { width: 18, height: 6, borderRadius: 6, backgroundColor: '#47c5d3', boxShadow: '0 0 0 3px rgba(71,197,211,0.18), 0 3px 14px rgba(71,197,211,0.7)' },
  strand: { width: 18, height: 5, borderRadius: 5, backgroundColor: '#e5ebf0', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' },
  pellet: { width: 9, height: 7, borderRadius: 2.5, backgroundColor: '#ffffff', boxShadow: '0 0 0 2px rgba(71,197,211,0.55), 0 3px 8px rgba(0,0,0,0.4)' },
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Eased progress of the move away from station `k` (0 while it dwells there). */
function moveOf(t: number, k: number) {
  const f = t - k;
  if (f <= DWELL) return 0;
  if (f >= 1) return 1;
  const x = (f - DWELL) / (1 - DWELL);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * A production line: one unit of material travels from station to station,
 * changing form as it goes, while the station it is at comes to life.
 * Pauses on hover, keyboard focus, the pause button, or when off screen; with
 * reduced motion the line is shown complete and still.
 */
export function ProcessFlow({ steps, label }: { steps: FlowStep[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '-10% 0px -10% 0px' });
  const reduce = useReducedMotion() ?? false;
  const wide = useMediaQuery('(min-width: 1280px)') && steps.length <= 8;
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [station, setStation] = useState(0);
  const n = steps.length;
  const t = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (reduce || paused || hovering || !inView) return;
    // Cap the step so returning to a background tab does not jump the line.
    t.set((t.get() + Math.min(delta, 100) / 1000 / STATION_SECONDS) % n);
  });
  useMotionValueEvent(t, 'change', (v) => setStation(Math.floor(v)));

  const still = reduce;
  return (
    <div ref={root} onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
      {!still && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-semibold text-white/80 transition-colors hover:border-cyan hover:text-white"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? 'Play animation' : 'Pause animation'}
          </button>
        </div>
      )}
      <ol
        aria-label={label}
        className={`mt-8 grid ${wide ? 'gap-x-6' : 'gap-y-10'}`}
        style={wide ? { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` } : undefined}
      >
        {steps.map((s, i) => {
          const state = still ? 'done' : i === station ? 'active' : i < station ? 'done' : 'next';
          return (
            <motion.li
              key={`${i}-${s.title}`}
              className={`relative ${wide ? 'text-left' : 'grid grid-cols-[64px_1fr] gap-x-5'}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, delay: Math.min(i * 0.07, 0.5), ease: easePremium }}
            >
              {i < n - 1 && <Connector t={t} k={i} wide={wide} still={still} material={s.output ?? 'pellet'} carrying={!still && station === i} />}
              <span
                data-active={state === 'active'}
                className={`relative z-10 grid h-16 w-16 place-items-center rounded-full border bg-navy transition-[color,border-color,box-shadow] duration-500 ${
                  state === 'active'
                    ? 'border-cyan text-cyan shadow-[0_0_0_6px_rgba(71,197,211,0.12),0_14px_32px_-10px_rgba(71,197,211,0.6)]'
                    : state === 'done'
                      ? 'border-cyan/35 text-cyan/75'
                      : 'border-white/15 text-white/45'
                }`}
              >
                <ProcessIcon name={s.icon} className="h-9 w-9" />
              </span>
              <div className={wide ? 'mt-6 pr-2' : 'pt-1'}>
                <span className={`tabular font-display text-xs font-semibold tracking-[0.2em] transition-colors duration-500 ${state === 'next' ? 'text-white/60' : 'text-cyan'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={`mt-2 font-display text-lg leading-snug font-bold tracking-tight transition-colors duration-500 ${state === 'next' ? 'text-white/80' : 'text-white'}`}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-silver/70">{s.text}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/** The track between station `k` and the next, filled as the material moves along it. */
function Connector({ t, k, wide, still, material, carrying }: { t: MotionValue<number>; k: number; wide: boolean; still: boolean; material: Material; carrying: boolean }) {
  const fill = useTransform(t, (v) => (still ? 1 : v >= k + 1 ? 1 : v < k ? 0 : moveOf(v, k)));
  const travel = useTransform(fill, (f) => `${f * 100 - 100}%`);
  // Horizontal: from this icon's right edge to the next icon's left edge (24px column gap).
  // Vertical: from this icon's bottom edge to the next icon's top edge (40px row gap).
  const box = wide ? 'top-8 left-[68px] h-px w-[calc(100%+24px-72px)]' : 'top-[68px] left-8 w-px h-[calc(100%-32px)]';
  return (
    <span aria-hidden="true" className={`absolute ${box}`}>
      <span className={`absolute inset-0 ${wide ? 'bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0_6px,transparent_6px_12px)]' : 'bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.22)_0_6px,transparent_6px_12px)]'}`} />
      <motion.span className={`absolute inset-0 bg-cyan/70 ${wide ? 'origin-left' : 'origin-top'}`} style={wide ? { scaleX: fill } : { scaleY: fill }} />
      {carrying && (
        <motion.span className="absolute inset-0" style={wide ? { x: travel } : { y: travel }}>
          <motion.span
            className={`absolute ${wide ? 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'}`}
            initial={false}
            animate={wide ? materialStyle[material] : { ...materialStyle[material], width: materialStyle[material].height, height: materialStyle[material].width }}
            transition={{ duration: 0.35 }}
          />
        </motion.span>
      )}
    </span>
  );
}
