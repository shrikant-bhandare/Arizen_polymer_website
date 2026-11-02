import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrolledPast } from '../lib/hooks';
import { scrollToSection } from '../lib/sections';

/** Floating back-to-top control with a ring that tracks reading progress. */
export function BackToTop() {
  const visible = useScrolledPast(700);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => scrollToSection('top')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.35 }}
          className="screen-only fixed right-4 bottom-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-navy text-white shadow-[0_10px_30px_-10px_rgba(16,28,44,0.6)] transition-colors hover:bg-blue sm:right-6 sm:bottom-6"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#51C7D9" strokeWidth="1.5" style={{ pathLength: progress }} />
          </svg>
          <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">Back to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
