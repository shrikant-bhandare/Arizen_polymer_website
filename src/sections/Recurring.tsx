import { Check } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { recurring, recurringTotal } from '../content/proposal';
import { rupees } from '../lib/format';
import { sectionNumber } from '../lib/sections';

export function Recurring() {
  const m = recurring.maintenance;
  return (
    <section id="recurring" aria-labelledby="recurring-title" className="bg-paper py-24 sm:py-32 lg:py-40">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeader
            number={sectionNumber('recurring')}
            label={recurring.heading}
            title={['Running costs,', 'clearly estimated.']}
            headingId="recurring-title"
            intro={recurring.intro}
            titleClassName="text-[clamp(2.25rem,4.6vw,4.25rem)]"
          />

          <Reveal delay={0.1}>
            <table className="mt-14 w-full border-collapse text-left">
              <caption className="sr-only">Estimated annual recurring costs</caption>
              <thead>
                <tr className="border-b-2 border-navy text-xs text-muted">
                  <th scope="col" className="py-3 font-medium">Service</th>
                  <th scope="col" className="py-3 text-right font-medium">Estimated Annual Cost</th>
                </tr>
              </thead>
              <tbody>
                {recurring.lines.map((line) => (
                  <tr key={line.service} className="border-b border-navy/10">
                    <th scope="row" className="py-5 pr-4 font-display text-base font-semibold tracking-tight sm:text-lg">
                      {line.service}
                      {line.optional && <span className="ml-3 inline-block border border-blue/30 px-2 py-0.5 align-middle text-[0.65rem] font-semibold tracking-[0.14em] text-blue uppercase">Optional</span>}
                    </th>
                    <td className="tabular py-5 text-right font-display text-base font-semibold sm:text-lg">{line.cost}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pt-6 pr-4 align-top text-sm font-medium text-muted">
                    {recurring.totalLabel}
                  </th>
                  <td className="tabular pt-5 text-right font-display text-xl font-extrabold whitespace-nowrap sm:text-2xl">
                    {rupees(recurringTotal.min)}–{rupees(recurringTotal.max)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-8 text-sm leading-relaxed text-muted">{recurring.note}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="lg:col-span-5">
          <div className="bg-navy p-8 text-white sm:p-10 lg:mt-28">
            <p className="eyebrow text-cyan">Optional</p>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">{m.title}</h3>
            <p className="mt-6 flex items-baseline gap-3">
              <span className="tabular font-display text-5xl font-extrabold tracking-tight">{m.price}</span>
              <span className="text-silver/60">{m.period}</span>
            </p>
            <ul className="mt-8 space-y-4 border-t border-white/10 pt-8">
              {m.coverage.map((c) => (
                <li key={c} className="flex gap-3 text-silver/85">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan" strokeWidth={1.75} aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-silver/55">Maintenance is optional and separate from the project investment.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
