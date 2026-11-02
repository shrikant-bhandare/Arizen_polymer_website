import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` when scrolled into view. An invisible copy of the final
 * value reserves the width, so the layout never shifts while digits change.
 */
export function CountUp({ value, format, duration = 1.8, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  // With reduced motion the final figure is shown from the first paint.
  const display = reduce ? value : count;

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={`relative inline-grid tabular ${className ?? ''}`}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {format(value)}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {format(display)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
