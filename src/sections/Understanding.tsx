import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easePremium, Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { meta, understanding } from '../content/proposal';
import { sectionNumber } from '../lib/sections';

function Row({ label, children, index }: { label: string; children: ReactNode; index: number }) {
  return (
    <div className="relative grid gap-3 py-7 md:grid-cols-[14rem_1fr] md:gap-10">
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-navy/15"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: index * 0.12, ease: easePremium }}
      />
      <dt className="eyebrow pt-1.5 text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function Understanding() {
  return (
    <section id="understanding" aria-labelledby="understanding-title" className="bg-paper py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          number={sectionNumber('understanding')}
          label={understanding.heading}
          title={understanding.statement}
          headingId="understanding-title"
          className="max-w-5xl"
          titleClassName="text-[clamp(2rem,4.4vw,4rem)]"
        />

        <Reveal className="mt-16 lg:mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-navy pt-4 text-xs text-muted">
            <span className="eyebrow text-navy">Project Data Sheet</span>
            <span className="tabular">Ref. {meta.proposalNo}</span>
          </div>
          <dl>
            <Row label="Company" index={0}>
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{understanding.company}</p>
            </Row>
            <Row label="Industry" index={1}>
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{understanding.industry}</p>
            </Row>
            <Row label="Target audience" index={2}>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {understanding.audience.map((a) => (
                  <li key={a} className="flex items-center gap-3 font-display text-lg font-medium sm:text-xl">
                    <span className="h-1.5 w-1.5 rotate-45 bg-cyan" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </Row>
            <Row label="Core requirements" index={3}>
              <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {understanding.requirements.map((r) => (
                  <li key={r} className="flex gap-3 leading-relaxed text-navy/80">
                    <span className="mt-[0.7em] h-px w-4 shrink-0 bg-blue" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </Row>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
