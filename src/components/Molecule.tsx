import { motion } from 'framer-motion';
import { useMemo } from 'react';

type Point = [number, number];

interface Geometry {
  backbone: Point[];
  bonds: [Point, Point][];
  rings: { center: Point; vertices: Point[] }[];
  width: number;
  height: number;
}

/**
 * Abstract polymer chain: a zig-zag carbon backbone, optionally with
 * alternating pendant benzene rings (the polystyrene family).
 */
function buildGeometry(units: number, rings: boolean): Geometry {
  const dx = 64;
  const dy = 22;
  const bond = 38;
  const r = 28;
  const pad = rings ? dy + bond + r * 2 + 8 : dy + 12;
  const top = pad;

  const backbone: Point[] = Array.from({ length: units }, (_, i) => [30 + i * dx, top + (i % 2 ? -dy : dy)]);
  const bonds: [Point, Point][] = [];
  const ringList: Geometry['rings'] = [];

  if (rings) {
    backbone.forEach(([x, y], i) => {
      if (i % 2 === 0) return;
      const dir = i % 4 === 1 ? -1 : 1;
      const start: Point = [x, y];
      const end: Point = [x, y + dir * bond];
      const center: Point = [x, end[1] + dir * r];
      const vertices = Array.from({ length: 6 }, (_, k): Point => {
        const a = ((-90 + k * 60) * Math.PI) / 180;
        return [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)];
      });
      bonds.push([start, end]);
      ringList.push({ center, vertices });
    });
  }

  return { backbone, bonds, rings: ringList, width: 60 + (units - 1) * dx, height: top * 2 };
}

const toPath = (pts: Point[], close = false) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}${close ? ' Z' : ''}`;

interface MoleculeProps {
  units?: number;
  rings?: boolean;
  delay?: number;
  className?: string;
  /** Draw on mount (hero) or when scrolled into view. */
  immediate?: boolean;
  /** Render fully drawn with no animation (print). */
  still?: boolean;
}

export function Molecule({ units = 9, rings = true, delay = 0, className, immediate = true, still = false }: MoleculeProps) {
  const g = useMemo(() => buildGeometry(units, rings), [units, rings]);
  const trigger = immediate || still ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true } };
  const draw = (d: number, duration = 1.6) => ({
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { pathLength: { duration, delay: delay + d, ease: [0.65, 0, 0.35, 1] as const }, opacity: { duration: 0.3, delay: delay + d } } },
  });
  const pop = (d: number) => ({
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.6, delay: delay + d, ease: [0.22, 1, 0.36, 1] as const } },
  });

  return (
    <motion.svg viewBox={`0 0 ${g.width} ${g.height}`} className={className} initial={still ? false : 'hidden'} {...trigger} aria-hidden="true" fill="none">
      <motion.path d={toPath(g.backbone)} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" variants={draw(0, 2)} />
      {g.bonds.map(([a, b], i) => (
        <motion.path key={`b${i}`} d={toPath([a, b])} stroke="currentColor" strokeWidth={1.2} variants={draw(0.8 + i * 0.12, 0.5)} />
      ))}
      {g.rings.map((ring, i) => (
        <g key={`r${i}`}>
          <motion.path d={toPath(ring.vertices, true)} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" variants={draw(1.1 + i * 0.14, 1.2)} />
          <motion.circle cx={ring.center[0]} cy={ring.center[1]} r={14} stroke="#51C7D9" strokeOpacity={0.55} strokeWidth={1} variants={draw(1.6 + i * 0.14, 1)} />
          {ring.vertices.map(([x, y], k) => (
            <motion.circle key={k} cx={x} cy={y} r={2.2} fill="currentColor" variants={pop(1.9 + i * 0.14 + k * 0.03)} />
          ))}
        </g>
      ))}
      {g.backbone.map(([x, y], i) => (
        <motion.circle
          key={`a${i}`}
          cx={x}
          cy={y}
          r={i % 2 ? 4.2 : 3.2}
          fill={i % 3 === 0 ? '#51C7D9' : 'currentColor'}
         
          variants={pop(0.4 + i * 0.12)}
        />
      ))}
    </motion.svg>
  );
}
