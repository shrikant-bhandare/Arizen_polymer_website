import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { introduction } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

export function Introduction() {
  return (
    <section id="introduction" aria-labelledby="introduction-title" className="bg-white py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionHeader
            number={sectionNumber('introduction')}
            label="Introduction"
            title={introduction.heading}
            headingId="introduction-title"
            className="lg:col-span-7"
            titleClassName="text-[clamp(2.25rem,4.8vw,4.5rem)]"
          />
          <div className="lg:col-span-5 lg:pt-24">
            <Reveal>
              <p className="font-display text-xl leading-snug font-medium tracking-tight text-navy sm:text-2xl">
                {introduction.lead}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 leading-relaxed text-muted">{introduction.body}</p>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-24 flex items-center gap-4 lg:mt-32">
          <span className="eyebrow text-muted">What the website will achieve</span>
          <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
        </Reveal>
        <Stagger as="ol" className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {introduction.outcomes.map((o, i) => (
            <StaggerItem as="li" key={o.title} className="group border-b border-navy/10 py-8 sm:pr-10">
              <span className="tabular font-display text-sm font-semibold text-blue">{pad2(i + 1)}</span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{o.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">{o.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
