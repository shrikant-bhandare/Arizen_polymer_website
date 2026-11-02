import { ArrowUp, Download } from 'lucide-react';
import { accentStop } from '../components/Accent';
import { Molecule } from '../components/Molecule';
import { ParticleField } from '../components/ParticleField';
import { Placeholder } from '../components/Placeholder';
import { Reveal } from '../components/Reveal';
import { LineReveal } from '../components/SplitText';
import { NeureonixMark } from '../components/Wordmark';
import { closing, contact, meta } from '../content/proposal';
import { downloadProposalPdf } from '../lib/pdf';
import { scrollToSection, sectionNumber } from '../lib/sections';

function SignatureField({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div>
      <div className={`border-b border-dotted border-navy/35 ${tall ? 'h-16' : 'h-10'}`} />
      <p className="mt-2 text-xs tracking-wide text-muted">{label}</p>
    </div>
  );
}

function SignatureBlock({ party, seal = false }: { party: string; seal?: boolean }) {
  return (
    <div>
      <p className="eyebrow text-muted">For</p>
      <p className="mt-2 font-display text-lg font-semibold tracking-tight">{party}</p>
      <div className="mt-8 grid gap-6">
        <SignatureField label="Authorised signatory — name" />
        <SignatureField label="Designation" />
        <SignatureField label="Signature" tall />
        <div className="grid grid-cols-2 gap-6">
          <SignatureField label="Date" />
          {seal ? <SignatureField label="Company seal" /> : <SignatureField label="Place" />}
        </div>
      </div>
    </div>
  );
}

export function Closing() {
  return (
    <section id="acceptance" aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-navy text-white">
      <ParticleField seed={19} className="absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_20%_20%,rgba(40,100,168,0.25),transparent_70%)]" />
      <div aria-hidden="true" className="absolute top-24 right-[-25%] -z-10 w-[110vw] text-silver/20 sm:right-[-8%] sm:w-[70vw] lg:w-[48vw]">
        <div className="animate-drift">
          <Molecule units={9} immediate={false} className="h-auto w-full" />
        </div>
      </div>

      <div className="shell pt-28 pb-16 sm:pt-36 lg:pt-44">
        <Reveal className="eyebrow flex items-center gap-4 text-cyan">
          <span className="tabular">{sectionNumber('acceptance')}</span>
          <span className="h-px w-10 bg-cyan/50" aria-hidden="true" />
          <span>Contact &amp; Acceptance</span>
        </Reveal>
        <h2 id="closing-title" className="display mt-8 max-w-[15ch] text-[clamp(2.6rem,8.2vw,8.5rem)]">
          <LineReveal lines={closing.headline} renderLine={accentStop} />
        </h2>
        <Reveal delay={0.3} className="mt-8 max-w-2xl text-lg leading-relaxed text-silver/75 sm:text-xl">
          <p>{closing.supporting}</p>
        </Reveal>

        <Reveal delay={0.2} className="mt-20 grid gap-12 border-t border-white/10 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <NeureonixMark className="text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver/60">
              Prepared by {meta.preparedBy} for {meta.client}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadProposalPdf}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-navy transition-colors hover:bg-white"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('investment')}
                className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-sm font-medium transition-colors hover:border-cyan hover:text-cyan"
              >
                Review commercials
              </button>
            </div>
          </div>
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            {contact.map((c) => (
              <div key={c.label} className="border-t border-white/10 pt-4">
                <dt className="eyebrow text-silver/45">{c.label}</dt>
                <dd className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {c.value ? (
                    c.href ? (
                      <a href={c.href(c.value)} className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-cyan hover:decoration-cyan">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )
                  ) : (
                    <Placeholder label={c.label.toLowerCase()} tone="dark" />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="mt-24 bg-white p-6 text-navy sm:p-10 lg:p-14">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-navy pb-5">
            <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Client Acceptance</h3>
            <p className="tabular text-sm text-muted">
              Proposal {meta.proposalNo} · {meta.date}
            </p>
          </div>
          <p className="mt-6 max-w-3xl leading-relaxed text-navy/80">{closing.acceptance}</p>
          <div className="mt-10 grid gap-14 md:grid-cols-2 md:gap-16">
            <SignatureBlock party={meta.client} seal />
            <SignatureBlock party={meta.preparedBy} />
          </div>
        </Reveal>

        <footer className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 text-xs text-silver/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {meta.preparedBy} · Proposal {meta.proposalNo} · Confidential — prepared exclusively for {meta.client}.
          </p>
          <button type="button" onClick={() => scrollToSection('top')} className="inline-flex items-center gap-2 self-start text-silver/70 transition-colors hover:text-cyan sm:self-auto">
            Back to top
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </footer>
      </div>
    </section>
  );
}
