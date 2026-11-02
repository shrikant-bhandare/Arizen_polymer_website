import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export const easePremium = [0.22, 1, 0.36, 1] as const;

const inViewOnce = { once: true, margin: '0px 0px -12% 0px' } as const;

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: 'div' | 'li';
}

/** Fade-and-rise once when the element scrolls into view. */
export function Reveal({ children, delay = 0, y = 28, as = 'div', ...rest }: RevealProps) {
  const Component = (as === 'li' ? motion.li : motion.div) as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inViewOnce}
      transition={{ duration: 0.9, delay, ease: easePremium }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easePremium } },
};

/** Container whose `StaggerItem` children reveal one after another. */
export function Stagger({ children, className, gap = 0.08, delay = 0, as = 'div' }: { children: ReactNode; className?: string; gap?: number; delay?: number; as?: 'div' | 'ul' | 'ol' }) {
  const Component = as === 'ul' ? motion.ul : as === 'ol' ? motion.ol : motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const Component = as === 'li' ? motion.li : motion.div;
  return (
    <Component className={className} variants={staggerItem}>
      {children}
    </Component>
  );
}
