import { motion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';
import { useState } from 'react';
import { CountUp } from '../components/CountUp';
import { easePremium, Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { commercial, projectTotal } from '../content/proposal';
import { pad2, rupees } from '../lib/format';
import { scrollToSection, sectionNumber } from '../lib/sections';

/** Six steps from navy to cyan so each cost line keeps a distinct, ordered tone. */
const tones = ['#101C2C', '#1D3A5F', '#2864A8', '#3C8FC0', '#51C7D9', '#9FDCE6'];

export function Investment() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="investment" aria-labelledby="investment-title" className="bg-white py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          number={sectionNumber('investment')}
          label="Commercial Proposal"
          title={['AN INVESTMENT IN', 'YOUR DIGITAL FUTURE.']}
          headingId="investment-title"
          titleClassName="text-[clamp(2.25rem,5.6vw,5.25rem)]"
        />

        <Reveal className="mt-16 grid gap-8 border-t border-navy pt-10 lg:mt-24 lg:grid-cols-12 lg:items-end">
          <p className="display text-[clamp(4.25rem,17vw,13.5rem)] leading-[0.85] tracking-[-0.055em] text-navy lg:col-span-8">
            <CountUp value={projectTotal} format={rupees} duration={2.2} />
          </p>
          <div className="lg:col-span-4 lg:pb-4">
            <p className="font-display text-xl font-semibold tracking-tight">{commercial.caption}</p>
            <p className="mt-2 text-muted">{commercial.gstNote}</p>
            <button
              type="button"
              onClick={() => scrollToSection('payments')}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue"
            >
              Payable across four milestones
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        <div className="mt-20 lg:mt-28">
          <Reveal className="flex items-center justify-between gap-4">
            <h3 className="eyebrow text-navy">Cost Breakdown</h3>
            <span className="hidden text-xs text-muted sm:inline">Amounts in Indian Rupees, exclusive of GST</span>
          </Reveal>

          {/* Proportional bar: each segment is that line's share of the total. */}
          <div className="mt-6 flex h-3 w-full gap-[2px] overflow-hidden" aria-hidden="true">
            {commercial.lines.map((line, i) => (
              <motion.span
                key={line.description}
                className="h-full origin-left transition-opacity duration-300"
                style={{ width: `${(line.amount / projectTotal) * 100}%`, background: tones[i], opacity: hovered === null || hovered === i ? 1 : 0.2 }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: easePremium }}
              />
            ))}
          </div>

          <table className="mt-8 w-full border-collapse text-left">
            <caption className="sr-only">Cost breakdown of the website design and development investment</caption>
            <thead>
              <tr className="border-b border-navy/15 text-xs text-muted">
                <th scope="col" className="w-10 py-3 font-medium sm:w-14">
                  <span className="sr-only">Line</span>
                </th>
                <th scope="col" className="py-3 font-medium">Description</th>
                <th scope="col" className="hidden py-3 text-right font-medium sm:table-cell">Share</th>
                <th scope="col" className="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {commercial.lines.map((line, i) => (
                <motion.tr
                  key={line.description}
                  tabIndex={0}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="border-b border-navy/10 transition-colors duration-300 outline-none hover:bg-paper focus-visible:bg-paper"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: easePremium }}
                >
                  <td className="py-5 align-middle sm:py-6">
                    <span className="block h-2.5 w-2.5" style={{ background: tones[i] }} aria-hidden="true" />
                  </td>
                  <td className="py-5 pr-4 align-middle sm:py-6">
                    <span className="tabular mr-3 text-xs text-muted">{pad2(i + 1)}</span>
                    <span className="font-display text-base font-semibold tracking-tight sm:text-xl">{line.description}</span>
                  </td>
                  <td className="tabular hidden py-5 text-right align-middle text-sm text-muted sm:table-cell sm:py-6">
                    {((line.amount / projectTotal) * 100).toFixed(1)}%
                  </td>
                  <td className="tabular py-5 text-right align-middle font-display text-base font-semibold whitespace-nowrap sm:py-6 sm:text-xl">{rupees(line.amount)}</td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy">
                <td />
                <th scope="row" className="py-6 font-display text-lg font-bold tracking-tight sm:text-2xl">
                  Total
                </th>
                <td className="hidden sm:table-cell" />
                <td className="tabular py-6 text-right font-display text-lg font-extrabold whitespace-nowrap sm:text-2xl">{rupees(projectTotal)}</td>
              </tr>
              <tr>
                <td />
                <td colSpan={3} className="text-sm text-muted">
                  {commercial.gstNote}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
