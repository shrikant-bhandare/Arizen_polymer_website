import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { meta, terms } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

export function Terms() {
  return (
    <section id="terms" aria-labelledby="terms-title" className="bg-white py-24 sm:py-32 lg:py-40">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              number={sectionNumber('terms')}
              label={terms.heading}
              title={['The fine print,', 'made plain.']}
              headingId="terms-title"
              titleClassName="text-[clamp(2.25rem,4vw,3.75rem)]"
            />
            <Reveal delay={0.2} className="mt-10 border-l-2 border-cyan pl-5">
              <p className="eyebrow text-muted">Quotation valid until</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight">{meta.validUntil}</p>
              <p className="mt-1 text-sm text-muted">
                {meta.validityDays} days from {meta.date}
              </p>
            </Reveal>
          </div>
        </div>

        <Stagger as="ol" gap={0.05} className="border-t border-navy/10 lg:col-span-8">
          {terms.items.map((t, i) => (
            <StaggerItem as="li" key={t} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-navy/10 py-6 sm:grid-cols-[3.5rem_1fr] sm:py-7">
              <span className="tabular pt-1 font-display text-sm font-semibold text-blue">{pad2(i + 1)}</span>
              <p className="text-lg leading-relaxed text-navy/85 sm:text-xl">{t}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
