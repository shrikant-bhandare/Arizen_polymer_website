import type { ReactNode } from 'react';
import { Molecule } from '../components/Molecule';
import { NeureonixMark } from '../components/Wordmark';
import {
  architecture,
  closing,
  commercial,
  contact,
  deliverables,
  features,
  hero,
  introduction,
  meta,
  payments,
  portfolio,
  products,
  projectTotal,
  recurring,
  recurringTotal,
  scope,
  terms,
  timeline,
  understanding,
} from '../content/proposal';
import { pad2, rupees } from '../lib/format';
import { sectionNumber, type SectionId } from '../lib/sections';

/**
 * Static A4 document for printing and PDF export. It shares the content model
 * with the interactive presentation but contains no animation, so nothing can
 * print half-revealed, clipped or blank. Shown only under `@media print`.
 */

function Heading({ id, label, title }: { id: SectionId; label: string; title: string }) {
  return (
    <header className="mb-[6mm] break-after-avoid">
      <p className="font-display text-[7pt] font-semibold tracking-[0.28em] text-blue uppercase">
        {sectionNumber(id)} — {label}
      </p>
      <h2 className="mt-[2.5mm] font-display text-[19pt] leading-[1.1] font-extrabold tracking-[-0.02em] text-navy">{title}</h2>
    </header>
  );
}

function Page({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return <section className={first ? '' : 'break-before-page'}>{children}</section>;
}

function Block({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`break-inside-avoid ${className}`}>{children}</div>;
}

const th = 'border-b-[1.5pt] border-navy py-[2mm] text-left text-[7.5pt] font-semibold tracking-[0.06em] text-muted uppercase';
const td = 'border-b-[0.5pt] border-navy/15 py-[2.6mm] align-top';

export function PrintProposal() {
  return (
    <div className="print-only font-sans text-[9.5pt] leading-[1.5] text-navy" aria-hidden="true">
      {/* Cover: full-bleed, on its own margin-less named page. */}
      <section className="relative flex h-[296mm] w-[210mm] flex-col overflow-hidden bg-navy p-[18mm] text-white [page:cover] break-after-page">
        <div className="absolute top-[52mm] right-[-28mm] w-[150mm] text-silver/35">
          <Molecule units={9} still className="h-auto w-full" />
        </div>
        <NeureonixMark />
        <div className="mt-auto">
          <p className="flex items-center gap-[3mm] font-display text-[10pt] font-semibold tracking-[0.42em]">
            <span className="h-px w-[8mm] bg-cyan" />
            ARIZEN POLYMERS
          </p>
          <p className="mt-[3mm] font-display text-[7pt] font-semibold tracking-[0.28em] text-silver/60 uppercase">{hero.eyebrow}</p>
          <h1 className="mt-[8mm] font-display text-[44pt] leading-[0.98] font-extrabold tracking-[-0.035em]">
            {hero.headline[0]}
            <br />
            {hero.headline[1].slice(0, -1)}
            <span className="text-cyan">.</span>
          </h1>
          <p className="mt-[7mm] max-w-[120mm] text-[11pt] leading-[1.5] text-silver/80">{hero.supporting}</p>
          <dl className="mt-[14mm] grid grid-cols-4 gap-[6mm] border-t border-white/15 pt-[6mm]">
            {[
              ['Prepared by', meta.preparedBy],
              ['Proposal No.', meta.proposalNo],
              ['Date', meta.date],
              ['Valid until', meta.validUntil],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-[6.5pt] font-semibold tracking-[0.24em] text-silver/50 uppercase">{k}</dt>
                <dd className="mt-[1.5mm] font-display text-[10pt] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Page first>
        <Heading id="introduction" label="Introduction" title={introduction.heading} />
        <p className="font-display text-[12pt] leading-[1.45] font-medium">{introduction.lead}</p>
        <p className="mt-[3mm] text-muted">{introduction.body}</p>
        <p className="mt-[7mm] font-display text-[7pt] font-semibold tracking-[0.24em] text-muted uppercase">What the website will achieve</p>
        <ol className="mt-[2mm] grid grid-cols-2 gap-x-[8mm]">
          {introduction.outcomes.map((o, i) => (
            <li key={o.title} className="break-inside-avoid border-b-[0.5pt] border-navy/15 py-[3mm]">
              <span className="font-display text-[8pt] font-semibold text-blue">{pad2(i + 1)}</span>
              <p className="font-display text-[10.5pt] font-semibold">{o.title}</p>
              <p className="text-muted">{o.text}</p>
            </li>
          ))}
        </ol>

        <Block className="mt-[12mm]">
          <Heading id="understanding" label={understanding.heading} title={understanding.statement} />
          <dl className="border-t-[1.5pt] border-navy">
            {[
              ['Company', understanding.company],
              ['Industry', understanding.industry],
              ['Target audience', understanding.audience.join('  ·  ')],
              ['Core requirements', understanding.requirements.join('; ')],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[40mm_1fr] border-b-[0.5pt] border-navy/15 py-[3mm]">
                <dt className="font-display text-[7pt] font-semibold tracking-[0.2em] text-muted uppercase">{k}</dt>
                <dd className="font-display text-[10.5pt] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Block>
      </Page>

      <Page>
        <Heading id="products" label="Product Showcase" title={products.heading} />
        <p className="text-muted">{products.intro}</p>
        <div className="mt-[6mm] grid grid-cols-2 gap-[6mm]">
          {products.items.map((p, i) => (
            <Block key={p.id} className="border-[0.5pt] border-navy/15">
              <img src={p.printImage} alt="" className="h-[44mm] w-full object-cover" />
              <div className="p-[4mm]">
                <p className="font-display text-[7pt] font-semibold tracking-[0.2em] text-muted">P—{pad2(i + 1)}</p>
                <p className="mt-[1mm] font-display text-[22pt] leading-none font-extrabold tracking-[-0.03em]">{p.code}</p>
                <p className="mt-[1.5mm] font-display text-[10pt] font-semibold text-blue">{p.name}</p>
                <p className="mt-[2mm] text-[8.5pt] text-muted">{p.description}</p>
              </div>
            </Block>
          ))}
        </div>
        <Block className="mt-[5mm] border-l-[2pt] border-cyan pl-[4mm]">
          <p className="font-display text-[8.5pt] font-semibold">Each product page on the website will include</p>
          <p className="text-[8.5pt] text-muted">{products.pageIncludes.join('  ·  ')}</p>
        </Block>
        <p className="mt-[3mm] text-[7.5pt] text-muted italic">{products.imageNote}</p>
      </Page>

      <Page>
        <Heading id="scope" label={scope.heading} title="Seven areas. One coherent platform." />
        <p className="text-muted">{scope.intro}</p>
        <div className="mt-[5mm] grid grid-cols-2 gap-x-[8mm]">
          {scope.areas.map((a, i) => (
            <Block key={a.id} className="border-t-[0.5pt] border-navy/20 py-[3.5mm]">
              <p className="font-display text-[11pt] font-bold">
                <span className="mr-[2mm] text-[8pt] text-blue">{pad2(i + 1)}</span>
                {a.title}
              </p>
              <p className="mt-[0.5mm] text-[8.5pt] text-muted">{a.summary}</p>
              <ul className="mt-[1.5mm]">
                {a.items.map((item) => (
                  <li key={item} className="flex gap-[2mm] text-[8.5pt]">
                    <span className="text-cyan">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Block>
          ))}
        </div>
      </Page>

      <Page>
        <Heading id="features" label="Technical Features" title={features.heading} />
        <ol className="grid grid-cols-3 gap-x-[6mm] border-t-[0.5pt] border-navy/20">
          {features.items.map((f, i) => (
            <li key={f.title} className="break-inside-avoid border-b-[0.5pt] border-navy/15 py-[2mm]">
              <span className="font-display text-[7.5pt] font-semibold text-blue">{pad2(i + 1)}</span>
              <p className="font-display text-[9.5pt] font-semibold">{f.title}</p>
              <p className="text-[8pt] text-muted">{f.text}</p>
            </li>
          ))}
        </ol>

        <Block className="mt-[8mm]">
          <Heading id="foundation" label="Infrastructure & Experience" title={architecture.heading} />
          <p className="text-muted">{architecture.intro}</p>
        </Block>
        <table className="mt-[4mm] w-full border-collapse">
          <tbody>
            {architecture.layers.map((l, i) => (
              <tr key={l.id} className="break-inside-avoid">
                <td className={`${td} !py-[2mm] w-[8mm] font-display text-[8pt] font-semibold text-blue`}>{pad2(i + 1)}</td>
                <td className={`${td} !py-[2mm] w-[52mm] pr-[4mm] font-display font-semibold`}>{l.title}</td>
                <td className={`${td} !py-[2mm] text-[8.5pt] text-muted`}>{l.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      <Page>
        <Heading id="investment" label="Commercial Proposal" title={commercial.heading} />
        <Block className="flex items-end justify-between border-t-[1.5pt] border-navy pt-[5mm]">
          <p className="font-display text-[46pt] leading-none font-extrabold tracking-[-0.05em]">{rupees(projectTotal)}</p>
          <div className="text-right">
            <p className="font-display text-[11pt] font-semibold">{commercial.caption}</p>
            <p className="text-muted">{commercial.gstNote}</p>
          </div>
        </Block>
        <table className="mt-[8mm] w-full border-collapse">
          <caption className="mb-[2mm] text-left font-display text-[8pt] font-semibold tracking-[0.2em] uppercase">Cost Breakdown</caption>
          <thead>
            <tr>
              <th className={`${th} w-[10mm]`}>#</th>
              <th className={th}>Description</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {commercial.lines.map((l, i) => (
              <tr key={l.description}>
                <td className={`${td} text-muted`}>{pad2(i + 1)}</td>
                <td className={`${td} font-display text-[10pt] font-semibold`}>{l.description}</td>
                <td className={`${td} text-right font-display text-[10pt] font-semibold`}>{rupees(l.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border-t-[1.5pt] border-navy py-[3mm]" />
              <td className="border-t-[1.5pt] border-navy py-[3mm] font-display text-[11pt] font-extrabold">Total</td>
              <td className="border-t-[1.5pt] border-navy py-[3mm] text-right font-display text-[11pt] font-extrabold">{rupees(projectTotal)}</td>
            </tr>
            <tr>
              <td />
              <td colSpan={2} className="text-muted">
                {commercial.gstNote}
              </td>
            </tr>
          </tfoot>
        </table>

        <Block className="mt-[11mm]">
          <Heading id="payments" label="Payment Milestones" title={payments.heading} />
          <div className="grid grid-cols-4 gap-[3mm]">
            {payments.milestones.map((m, i) => (
              <div key={m.label} className={`p-[4mm] ${['bg-paper', 'bg-silver', 'bg-blue text-white', 'bg-navy text-white'][i]}`}>
                <p className="font-display text-[6.5pt] font-semibold tracking-[0.2em] uppercase opacity-70">Milestone {pad2(i + 1)}</p>
                <p className="mt-[3mm] font-display text-[26pt] leading-none font-extrabold tracking-[-0.04em]">{m.percent}%</p>
                <p className="mt-[2mm] font-display text-[12pt] font-bold">{rupees(m.amount)}</p>
                <p className="mt-[1.5mm] text-[8pt] leading-[1.35] opacity-80">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-[3mm] flex justify-between border-t-[0.5pt] border-navy/20 pt-[2.5mm]">
            <span className="font-display font-bold">Total {rupees(payments.milestones.reduce((s, m) => s + m.amount, 0))}</span>
            <span className="text-muted">{commercial.gstNote}</span>
          </p>
        </Block>
      </Page>

      <Page>
        <Heading id="timeline" label="Project Timeline" title={timeline.heading} />
        <p className="font-display text-[11pt] font-semibold">
          Estimated duration: <span className="text-blue">{timeline.duration}</span>
        </p>
        <table className="mt-[4mm] w-full border-collapse">
          <thead>
            <tr>
              <th className={`${th} w-[18mm]`}>Stage</th>
              <th className={`${th} w-[58mm]`}>Activity</th>
              <th className={`${th} w-[22mm]`}>Duration</th>
              <th className={th}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {timeline.stages.map((s, i) => (
              <tr key={s.title} className="break-inside-avoid">
                <td className={`${td} font-display font-semibold text-blue`}>{pad2(i + 1)}</td>
                <td className={`${td} pr-[3mm] font-display font-semibold`}>{s.title}</td>
                <td className={`${td} font-display font-semibold whitespace-nowrap`}>{s.days}</td>
                <td className={`${td} text-[8.5pt] text-muted`}>{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Block className="mt-[11mm]">
          <Heading id="recurring" label={recurring.heading} title="Running costs, clearly estimated." />
          <p className="text-muted">{recurring.intro}</p>
          <div className="mt-[4mm] grid grid-cols-[1fr_62mm] gap-[7mm]">
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Service</th>
                    <th className={`${th} text-right`}>Estimated Annual Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recurring.lines.map((l) => (
                    <tr key={l.service}>
                      <td className={`${td} font-display font-semibold`}>{l.service}</td>
                      <td className={`${td} text-right font-display font-semibold whitespace-nowrap`}>{l.cost}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-[3mm] pr-[3mm] text-[8.5pt] text-muted">{recurring.totalLabel}</td>
                    <td className="pt-[3mm] text-right font-display text-[11pt] font-extrabold whitespace-nowrap">
                      {rupees(recurringTotal.min)}–{rupees(recurringTotal.max)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <p className="mt-[3mm] text-[8pt] text-muted italic">{recurring.note}</p>
            </div>
            <div className="bg-navy p-[5mm] text-white">
              <p className="font-display text-[6.5pt] font-semibold tracking-[0.24em] text-cyan uppercase">Optional</p>
              <p className="mt-[1.5mm] font-display text-[10.5pt] font-bold">{recurring.maintenance.title}</p>
              <p className="mt-[2mm] font-display text-[20pt] font-extrabold">
                {recurring.maintenance.price} <span className="text-[8pt] font-medium text-silver/70">{recurring.maintenance.period}</span>
              </p>
              <ul className="mt-[3mm] space-y-[1mm] text-[8pt] text-silver/85">
                {recurring.maintenance.coverage.map((c) => (
                  <li key={c}>✓ {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Block>
      </Page>

      <Page>
        <Heading id="deliverables" label="Project Deliverables" title={deliverables.heading} />
        <ol className="grid grid-cols-2 gap-x-[8mm]">
          {deliverables.items.map((d, i) => (
            <li key={d} className="flex break-inside-avoid gap-[3mm] border-b-[0.5pt] border-navy/15 py-[2.4mm]">
              <span className="font-display text-[8pt] font-semibold text-blue">{pad2(i + 1)}</span>
              <span className="font-display font-semibold">{d}</span>
            </li>
          ))}
        </ol>

        <Block className="mt-[11mm]">
          <Heading id="terms" label={terms.heading} title="The fine print, made plain." />
        </Block>
        <ol>
          {terms.items.map((t, i) => (
            <li key={t} className="flex break-inside-avoid gap-[4mm] border-b-[0.5pt] border-navy/15 py-[2.4mm]">
              <span className="font-display text-[8pt] font-semibold text-blue">{pad2(i + 1)}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>

        <Block className="mt-[10mm]">
          <Heading id="portfolio" label="Portfolio" title={portfolio.items.length ? 'Selected Work.' : portfolio.heading} />
          {portfolio.items.length ? (
            <ul>
              {portfolio.items.map((p) => (
                <li key={p.url}>
                  <span className="font-semibold">{p.title}</span> — {p.url}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">{portfolio.text}</p>
          )}
        </Block>
      </Page>

      <Page>
        <Block className="bg-navy p-[9mm] text-white">
          <p className="font-display text-[7pt] font-semibold tracking-[0.28em] text-cyan uppercase">{sectionNumber('acceptance')} — Contact &amp; Acceptance</p>
          <p className="mt-[4mm] font-display text-[26pt] leading-[1.02] font-extrabold tracking-[-0.03em]">
            {closing.headline[0]}
            <br />
            {closing.headline[1].slice(0, -1)}
            <span className="text-cyan">.</span>
          </p>
          <p className="mt-[4mm] max-w-[140mm] text-[10pt] text-silver/80">{closing.supporting}</p>
          <dl className="mt-[6mm] grid grid-cols-4 gap-[4mm] border-t border-white/15 pt-[4mm]">
            {contact.map((c) => (
              <div key={c.label}>
                <dt className="font-display text-[6.5pt] font-semibold tracking-[0.2em] text-silver/50 uppercase">{c.label}</dt>
                <dd className="mt-[1mm] text-[9pt] font-semibold">{c.value ?? <span className="font-normal text-silver/50 italic">To be added</span>}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block className="mt-[8mm]">
          <div className="flex items-baseline justify-between border-b-[1.5pt] border-navy pb-[2.5mm]">
            <p className="font-display text-[15pt] font-bold">Client Acceptance</p>
            <p className="text-[8pt] text-muted">
              Proposal {meta.proposalNo} · {meta.date}
            </p>
          </div>
          <p className="mt-[3mm]">{closing.acceptance}</p>
          <div className="mt-[6mm] grid grid-cols-2 gap-[12mm]">
            {[
              { party: meta.client, last: 'Company seal' },
              { party: meta.preparedBy, last: 'Place' },
            ].map(({ party, last }) => (
              <div key={party}>
                <p className="font-display text-[6.5pt] font-semibold tracking-[0.2em] text-muted uppercase">For</p>
                <p className="font-display text-[10pt] font-semibold">{party}</p>
                {['Authorised signatory — name', 'Designation', 'Signature', 'Date', last].map((label) => (
                  <div key={label} className="mt-[3.5mm]">
                    <div className={`border-b-[0.75pt] border-dotted border-navy/40 ${label === 'Signature' ? 'h-[14mm]' : 'h-[7mm]'}`} />
                    <p className="mt-[1mm] text-[7pt] text-muted">{label}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Block>
      </Page>
    </div>
  );
}
