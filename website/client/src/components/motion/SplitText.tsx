import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { easePremium } from './Reveal';

const inViewOnce = { once: true, margin: '0px 0px -10% 0px' } as const;

function trigger(immediate: boolean) {
  return immediate ? { animate: 'show' } : { whileInView: 'show', viewport: inViewOnce };
}

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
}

/**
 * Letter-by-letter reveal. Screen readers get the whole string once;
 * the animated letters are hidden from assistive technology.
 */
export function SplitText({ text, className, delay = 0, stagger = 0.035, immediate = false }: SplitTextProps) {
  const words = text.split(' ');
  let index = 0;

  return (
    <motion.span className={className} aria-label={text} role="text" initial="hidden" {...trigger(immediate)}>
      {words.map((word, w) => (
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {Array.from(word).map((char) => {
            const i = index++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: '0.35em', filter: 'blur(6px)' },
                  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, delay: delay + i * stagger, ease: easePremium } },
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {w < words.length - 1 && ' '}
        </span>
      ))}
    </motion.span>
  );
}

interface LineRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: (i: number) => string;
  renderLine?: (line: string, i: number) => ReactNode;
  delay?: number;
  immediate?: boolean;
}

/** Masked line reveal: each line slides up from behind a clipping edge. */
export function LineReveal({ lines, className, lineClassName, renderLine, delay = 0, immediate = false }: LineRevealProps) {
  return (
    <motion.span className={className} aria-label={lines.join(' ')} role="text" initial="hidden" {...trigger(immediate)}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden="true" className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName?.(i) ?? ''}`}
            variants={{
              hidden: { y: '105%' },
              show: { y: 0, transition: { duration: 1.1, delay: delay + i * 0.14, ease: easePremium } },
            }}
          >
            {renderLine ? renderLine(line, i) : line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
