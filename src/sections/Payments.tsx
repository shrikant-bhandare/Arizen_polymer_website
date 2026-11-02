import { motion } from 'framer-motion';
import { CountUp } from '../components/CountUp';
import { easePremium, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { commercial, payments } from '../content/proposal';
import { pad2, rupees } from '../lib/format';
import { sectionNumber } from '../lib/sections';

/** Each block steps up in weight as the engagement progresses toward launch. */
const surfaces = [
  { block: 'bg-paper text-navy', muted: 'text-muted', track: 'bg-navy/10', fill: 'bg-blue' },
  { block: 'bg-silver text-navy', muted: 'text-navy/65', track: 'bg-navy/10', fill: 'bg-blue' },
  { block: 'bg-blue text-white', muted: 'text-white/75', track: 'bg-white/20', fill: 'bg-white' },
  { block: 'bg-navy text-white', muted: 'text-silver/70', track: 'bg-white/15', fill: 'bg-cyan' },
];

const total = payments.milestones.reduce((s, m) => s + m.amount, 0);

export function Payments() {
  let cumulative = 0;

  return (
    <section id="payments" aria-labelledby="payments-title" className="bg-white py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          number={sectionNumber('payments')}
          label="Payment Milestones"
          title={['A CLEAR & TRANSPARENT', 'ENGAGEMENT.']}
          headingId="payments-title"
          titleClassName="text-[clamp(2.25rem,5.6vw,5.25rem)]"
        />

        <Stagger as="ol" gap={0.12} className="mt-16 grid sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {payments.milestones.map((m, i) => {
            cumulative += m.percent;
            const s = surfaces[i];
            return (
              <StaggerItem as="li" key={m.label} className={`flex flex-col p-7 sm:p-8 lg:min-h-[26rem] ${s.block}`}>
                <p className={`eyebrow ${s.muted}`}>Milestone {pad2(i + 1)}</p>
                <p className="display mt-8 text-[clamp(4rem,7vw,6rem)] leading-none tracking-[-0.05em]">
                  <CountUp value={m.percent} format={(n) => `${n}%`} duration={1.4} />
                </p>
                <p className="tabular mt-4 font-display text-2xl font-bold tracking-tight">{rupees(m.amount)}</p>
                <p className={`mt-3 leading-relaxed ${s.muted}`}>{m.label}</p>
                <div className="mt-auto pt-10">
                  <div className={`h-1 w-full ${s.track}`}>
                    <motion.div
                      className={`h-full origin-left ${s.fill}`}
                      style={{ width: `${cumulative}%` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: easePremium }}
                    />
                  </div>
                  <p className={`tabular mt-3 text-xs ${s.muted}`}>{cumulative}% of project value</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <div className="mt-8 flex flex-col gap-2 border-t border-navy/10 pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-display text-lg font-semibold tracking-tight">
            Total <span className="tabular ml-3 text-2xl font-extrabold">{rupees(total)}</span>
          </p>
          <p className="text-sm text-muted">{commercial.gstNote}</p>
        </div>
      </div>
    </section>
  );
}
