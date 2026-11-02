import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { deliverables } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

function DrawnCheck({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7 shrink-0" aria-hidden="true" fill="none">
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.2" />
      <motion.path
        d="M8.5 14.5l3.6 3.6 7.4-8"
        stroke="#51C7D9"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function Deliverables() {
  return (
    <section id="deliverables" aria-labelledby="deliverables-title" className="bg-graphite py-24 text-white sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            number={sectionNumber('deliverables')}
            label="Project Deliverables"
            title={deliverables.heading}
            headingId="deliverables-title"
            tone="dark"
            className="lg:col-span-8"
          />
          <Reveal delay={0.1} className="flex items-baseline gap-4 lg:col-span-4 lg:justify-end">
            <span className="tabular font-display text-6xl font-extrabold tracking-tight text-cyan">{deliverables.items.length}</span>
            <span className="text-silver/60">deliverables at handover</span>
          </Reveal>
        </div>

        <Stagger as="ol" gap={0.05} className="mt-16 grid gap-x-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {deliverables.items.map((item, i) => (
            <StaggerItem as="li" key={item} className="flex items-start gap-4 border-t border-white/10 py-6">
              <DrawnCheck delay={0.3 + i * 0.06} />
              <div>
                <span className="tabular text-xs text-white/40">{pad2(i + 1)}</span>
                <p className="mt-1 font-display text-lg leading-snug font-semibold tracking-tight">{item}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
