import { motion } from 'framer-motion';
import type { ScopeArea } from '../content/proposal';

/** Block kinds: f = neutral fill, a = cyan accent, b = blue, l = text line, d = dark, o = circle (x, y = centre, w = radius). */
type Block = [x: number, y: number, w: number, h: number, kind: 'f' | 'a' | 'b' | 'l' | 'd' | 'o'];

const nav: Block[] = [
  [12, 12, 24, 8, 'b'],
  [120, 14, 68, 4, 'l'],
];

const layouts: Record<ScopeArea['layout'], Block[]> = {
  home: [
    ...nav,
    [12, 28, 176, 66, 'd'],
    [22, 46, 90, 7, 'a'],
    [22, 58, 70, 4, 'l'],
    [22, 76, 36, 9, 'a'],
    [12, 102, 56, 42, 'f'],
    [72, 102, 56, 42, 'f'],
    [132, 102, 56, 42, 'f'],
    [12, 154, 80, 4, 'l'],
    [12, 163, 92, 4, 'l'],
    [12, 172, 70, 4, 'l'],
    [108, 152, 80, 38, 'f'],
    [12, 200, 176, 28, 'b'],
    [70, 211, 60, 6, 'a'],
  ],
  about: [
    ...nav,
    [12, 32, 120, 8, 'd'],
    [12, 44, 84, 8, 'd'],
    [12, 62, 84, 72, 'f'],
    [104, 66, 84, 4, 'l'],
    [104, 76, 76, 4, 'l'],
    [104, 86, 84, 4, 'l'],
    [104, 96, 60, 4, 'l'],
    [32, 156, 11, 0, 'o'],
    [76, 156, 11, 0, 'o'],
    [120, 156, 11, 0, 'o'],
    [164, 156, 11, 0, 'o'],
    [12, 182, 176, 46, 'd'],
    [24, 196, 120, 4, 'a'],
    [24, 206, 90, 4, 'l'],
  ],
  catalog: [
    ...nav,
    [12, 28, 44, 200, 'f'],
    [18, 36, 30, 4, 'l'],
    [18, 46, 26, 4, 'l'],
    [18, 56, 30, 4, 'l'],
    [62, 28, 60, 54, 'f'],
    [128, 28, 60, 54, 'a'],
    [62, 88, 60, 54, 'f'],
    [128, 88, 60, 54, 'f'],
    [62, 148, 60, 54, 'f'],
    [128, 148, 60, 54, 'f'],
    [62, 212, 126, 16, 'b'],
  ],
  infrastructure: [
    ...nav,
    [12, 28, 176, 92, 'd'],
    [22, 98, 80, 6, 'a'],
    [12, 126, 56, 50, 'f'],
    [72, 126, 56, 50, 'f'],
    [132, 126, 56, 50, 'f'],
    [12, 188, 160, 4, 'l'],
    [12, 198, 140, 4, 'l'],
    [12, 208, 150, 4, 'l'],
  ],
  quality: [
    ...nav,
    [12, 32, 110, 8, 'd'],
    [12, 46, 150, 4, 'l'],
    [12, 56, 130, 4, 'l'],
    [28, 96, 160, 1, 'l'],
    [28, 96, 10, 0, 'o'],
    [72, 96, 10, 0, 'o'],
    [116, 96, 10, 0, 'o'],
    [160, 96, 10, 0, 'o'],
    [12, 132, 56, 64, 'f'],
    [72, 132, 56, 64, 'f'],
    [132, 132, 56, 64, 'f'],
    [24, 150, 32, 24, 'a'],
    [12, 208, 120, 4, 'l'],
  ],
  contact: [
    ...nav,
    [12, 32, 92, 14, 'f'],
    [12, 52, 92, 14, 'f'],
    [12, 72, 92, 14, 'f'],
    [12, 92, 92, 42, 'f'],
    [12, 142, 52, 16, 'b'],
    [112, 32, 76, 126, 'f'],
    [150, 88, 7, 0, 'o'],
    [12, 176, 100, 4, 'l'],
    [12, 186, 80, 4, 'l'],
    [12, 196, 90, 4, 'l'],
    [140, 178, 48, 20, 'a'],
  ],
  admin: [
    [12, 12, 40, 216, 'd'],
    [20, 24, 24, 4, 'a'],
    [20, 40, 24, 3, 'l'],
    [20, 50, 24, 3, 'l'],
    [20, 60, 24, 3, 'l'],
    [58, 12, 130, 12, 'f'],
    [58, 32, 40, 32, 'a'],
    [103, 32, 40, 32, 'f'],
    [148, 32, 40, 32, 'f'],
    [58, 74, 130, 14, 'f'],
    [58, 94, 130, 14, 'f'],
    [58, 114, 130, 14, 'f'],
    [58, 134, 130, 14, 'f'],
    [58, 154, 130, 14, 'f'],
    [58, 196, 60, 16, 'b'],
  ],
};

const fills: Record<Block[4], { fill: string; opacity?: number }> = {
  f: { fill: '#DCE3EB' },
  a: { fill: '#51C7D9', opacity: 0.85 },
  b: { fill: '#2864A8' },
  l: { fill: '#101C2C', opacity: 0.18 },
  d: { fill: '#182432' },
  o: { fill: '#DCE3EB' },
};

/** Low-fidelity wireframe of a proposed page, used to illustrate scope. */
export function PageSchematic({ layout, className }: { layout: ScopeArea['layout']; className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={`Indicative ${layout} page layout`}>
      <rect x="0.5" y="0.5" width="199" height="239" rx="3" fill="#fff" stroke="#101C2C" strokeOpacity="0.12" />
      {layouts[layout].map(([x, y, w, h, kind], i) => {
        const style = fills[kind];
        const motionProps = {
          initial: { opacity: 0 },
          animate: { opacity: style.opacity ?? 1 },
          transition: { duration: 0.5, delay: 0.15 + i * 0.035 },
        };
        return kind === 'o' ? (
          <motion.circle key={i} cx={x} cy={y} r={w} fill={style.fill} {...motionProps} />
        ) : (
          <motion.rect key={i} x={x} y={y} width={w} height={h} rx={kind === 'l' ? 1 : 1.5} fill={style.fill} {...motionProps} />
        );
      })}
    </svg>
  );
}
