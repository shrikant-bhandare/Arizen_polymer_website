import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import { LineReveal } from './SplitText';

interface SectionHeaderProps {
  number: string;
  label: string;
  title: string | string[];
  intro?: ReactNode;
  tone?: 'light' | 'dark' | 'blue';
  className?: string;
  titleClassName?: string;
  headingId?: string;
}

export function SectionHeader({ number, label, title, intro, tone = 'light', className, titleClassName, headingId }: SectionHeaderProps) {
  const dark = tone !== 'light';
  const lines = Array.isArray(title) ? title : [title];
  const accent = { light: 'text-blue', dark: 'text-cyan', blue: 'text-white/80' }[tone];
  const rule = { light: 'bg-blue/40', dark: 'bg-cyan/50', blue: 'bg-white/40' }[tone];
  const introColor = { light: 'text-muted', dark: 'text-silver/75', blue: 'text-white/80' }[tone];
  return (
    <header className={className}>
      <Reveal className={`eyebrow flex items-center gap-4 ${accent}`}>
        <span className="tabular">{number}</span>
        <span className={`h-px w-10 ${rule}`} aria-hidden="true" />
        <span>{label}</span>
      </Reveal>
      <h2 id={headingId} className={`display mt-6 text-balance ${dark ? 'text-white' : 'text-navy'} ${titleClassName ?? 'text-[clamp(2.25rem,5.2vw,4.75rem)]'}`}>
        <LineReveal lines={lines} />
      </h2>
      {intro && (
        <Reveal delay={0.15} className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${introColor}`}>
          {intro}
        </Reveal>
      )}
    </header>
  );
}
