import type { ReactNode } from 'react';
import { Reveal } from '../motion/Reveal';
import { LineReveal } from '../motion/SplitText';

interface Props {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
  titleClassName?: string;
}

/** Eyebrow, masked headline reveal and optional introduction, used by every section. */
export function SectionHeading({ eyebrow, title, intro, tone = 'light', as: Tag = 'h2', id, className = '', titleClassName = 'text-[clamp(2rem,4.6vw,4rem)]' }: Props) {
  const dark = tone === 'dark';
  return (
    <header className={className}>
      {eyebrow && (
        <Reveal className={`eyebrow flex items-center gap-4 ${dark ? 'text-cyan' : 'text-blue'}`}>
          <span className={`h-px w-10 ${dark ? 'bg-cyan/50' : 'bg-blue/40'}`} aria-hidden="true" />
          <span>{eyebrow}</span>
        </Reveal>
      )}
      <Tag id={id} className={`display mt-5 text-balance ${dark ? 'text-white' : 'text-navy'} ${titleClassName}`}>
        <LineReveal lines={title.split('\n')} />
      </Tag>
      {intro && (
        <Reveal delay={0.12} className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${dark ? 'text-silver/75' : 'text-muted'}`}>
          {intro}
        </Reveal>
      )}
    </header>
  );
}
