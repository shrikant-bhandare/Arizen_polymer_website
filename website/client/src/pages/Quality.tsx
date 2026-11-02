import { BadgeCheck, FileCheck2 } from 'lucide-react';
import { useLoaderData } from 'react-router';
import type { TitledItem } from '@shared/content';
import { Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { ButtonLink } from '../components/ui/Button';
import { Img } from '../components/ui/Img';
import { PageHero } from '../components/ui/PageHero';
import { ConceptualNote, Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import type { ContentMap } from '../lib/types';

function ItemList({ items, label, tone = 'light' }: { items: TitledItem[]; label: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  if (!items.length) return <Pending tone={tone} label={label} className="mt-10" />;
  return (
    <Stagger as="ol" className="mt-10">
      {items.map((it, i) => (
        <StaggerItem as="li" key={it.title} className={`grid grid-cols-[3rem_1fr] gap-4 border-t py-7 ${dark ? 'border-white/10' : 'border-navy/10'}`}>
          <span className={`tabular pt-1 font-display text-sm font-semibold ${dark ? 'text-cyan' : 'text-blue'}`}>{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">{it.title}</h3>
            {it.text && <p className={`mt-2 leading-relaxed ${dark ? 'text-silver/70' : 'text-muted'}`}>{it.text}</p>}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export default function Quality() {
  const c = useLoaderData() as ContentMap['quality'];

  return (
    <>
      <Seo title="Quality Control" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="Quality Control" title={c.heading} intro={c.intro || undefined} crumbs={[{ label: 'Quality Control' }]}>
        {!c.intro && <Pending tone="dark" label="Quality introduction" className="mt-8 max-w-xl" />}
      </PageHero>

      <section aria-labelledby="philosophy-title" className="bg-white py-24 sm:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Philosophy" title={c.philosophy.heading} id="philosophy-title" titleClassName="text-[clamp(2rem,3.8vw,3.5rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 text-lg leading-relaxed text-navy/80">
              {c.philosophy.body.length ? c.philosophy.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label="Quality philosophy" />}
            </Reveal>
          </div>
          {c.image.url && (
            <Reveal delay={0.1} className="lg:col-span-6">
              <figure>
                <div className="aspect-[4/3] overflow-hidden bg-paper">
                  <Img src={c.image.url} alt={c.image.alt} sizes="(min-width: 1024px) 45vw, 100vw" className={`h-full w-full ${c.imageIsConceptual ? 'object-contain p-6' : 'object-cover'}`} />
                </div>
                {c.imageIsConceptual && (
                  <figcaption className="mt-3">
                    <ConceptualNote />
                  </figcaption>
                )}
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      <section aria-label="Processes and testing" className="bg-paper py-24 sm:py-32">
        <div className="shell grid gap-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Assurance" title={c.processes.heading} titleClassName="text-[clamp(2rem,3.4vw,3rem)]" />
            <ItemList items={c.processes.items} label="Quality assurance processes" />
          </div>
          <div>
            <SectionHeading eyebrow="Testing" title={c.testing.heading} titleClassName="text-[clamp(2rem,3.4vw,3rem)]" />
            <ItemList items={c.testing.items} label="Testing procedures and equipment" />
          </div>
        </div>
      </section>

      <section aria-labelledby="docs-title" className="bg-industrial py-24 text-white sm:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Documentation" title={c.documentation.heading} id="docs-title" tone="dark" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 leading-relaxed text-silver/80">
              {c.documentation.body.length ? c.documentation.body.map((p, i) => <p key={i}>{p}</p>) : <Pending tone="dark" label="Quality documentation provided with supplies" />}
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {c.documentation.documents.length > 0 && (
              <Stagger as="ul" className="grid gap-3 sm:grid-cols-2">
                {c.documentation.documents.map((d) => (
                  <StaggerItem as="li" key={d} className="flex items-center gap-3 border border-white/10 px-5 py-4">
                    <FileCheck2 className="h-5 w-5 shrink-0 text-cyan" strokeWidth={1.5} aria-hidden="true" />
                    {d}
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="cert-title" className="bg-white py-24 sm:py-32">
        <div className="shell">
          <SectionHeading eyebrow="Standards" title={c.certifications.heading} id="cert-title" />
          {c.certifications.items.length ? (
            <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.certifications.items.map((cert) => (
                <StaggerItem as="li" key={cert.name} className="flex flex-col border border-navy/10 p-6">
                  {cert.image.url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-paper">
                      <Img src={cert.image.url} alt={cert.image.alt || cert.name} sizes="(min-width: 1024px) 30vw, 100vw" className="h-full w-full object-contain p-4" />
                    </div>
                  ) : (
                    <BadgeCheck className="h-10 w-10 text-blue" strokeWidth={1.25} aria-hidden="true" />
                  )}
                  <p className="mt-5 font-display text-lg font-bold tracking-tight">{cert.name}</p>
                  {cert.issuer && <p className="mt-1 text-sm text-muted">{cert.issuer}</p>}
                  {cert.validUntil && <p className="mt-auto pt-4 text-xs text-muted">Valid until {cert.validUntil}</p>}
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending label="Verified certifications and standards (only those Arizen holds and can evidence)" className="mt-12" />
          )}
          <Reveal className="mt-16 flex flex-col gap-6 border-t border-navy/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-muted">Need certificates of analysis or quality documentation for a specific supply? Ask the Arizen team.</p>
            <ButtonLink href="/contact" variant="secondary">
              Contact the team
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
