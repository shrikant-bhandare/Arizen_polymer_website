import { useLoaderData } from 'react-router';
import { Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { Img } from '../components/ui/Img';
import { PageHero } from '../components/ui/PageHero';
import { ConceptualNote, Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import type { ContentMap } from '../lib/types';

type Section = ContentMap['infrastructure']['facilities'];

function ImageSection({ section, index, eyebrow }: { section: Section; index: number; eyebrow: string }) {
  const flip = index % 2 === 1;
  return (
    <section aria-label={section.heading} className={`py-20 sm:py-28 ${flip ? 'bg-paper' : 'bg-white'}`}>
      <div className={`shell grid items-center gap-12 lg:grid-cols-12 lg:gap-20`}>
        <Reveal className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <figure>
            <div className={`relative aspect-[4/3] overflow-hidden ${flip ? 'bg-white' : 'bg-paper'}`}>
              {section.image.url ? (
                <Img src={section.image.url} alt={section.image.alt} sizes="(min-width: 1024px) 55vw, 100vw" className={`h-full w-full ${section.imageIsConceptual ? 'object-contain p-6' : 'object-cover'}`} />
              ) : (
                <div className="grid h-full place-items-center p-8">
                  <Pending label={`${section.heading}: photograph`} />
                </div>
              )}
            </div>
            {section.imageIsConceptual && section.image.url && (
              <figcaption className="mt-3">
                <ConceptualNote />
              </figcaption>
            )}
          </figure>
        </Reveal>
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={`${String(index + 1).padStart(2, '0')} — ${eyebrow}`} title={section.heading} titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
          <Reveal delay={0.1} className="prose-body mt-6 leading-relaxed text-muted">
            {section.body.length ? section.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label={`${section.heading}: description`} />}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Infrastructure() {
  const c = useLoaderData() as ContentMap['infrastructure'];
  const sections: [Section, string][] = [
    [c.facilities, 'Facilities'],
    [c.storage, 'Storage'],
    [c.distribution, 'Distribution'],
    [c.handling, 'Handling'],
  ];

  return (
    <>
      <Seo title="Infrastructure" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="Infrastructure" title={c.heading} intro={c.intro || undefined} crumbs={[{ label: 'Infrastructure' }]}>
        {!c.intro && <Pending tone="dark" label="Infrastructure introduction" className="mt-8 max-w-xl" />}
      </PageHero>

      {sections.map(([s, eyebrow], i) => (
        <ImageSection key={eyebrow} section={s} index={i} eyebrow={eyebrow} />
      ))}

      <section aria-labelledby="process-title" className="bg-navy py-24 text-white sm:py-32">
        <div className="shell">
          <SectionHeading eyebrow="Operations" title={c.processes.heading} id="process-title" tone="dark" />
          {c.processes.steps.length ? (
            <Stagger as="ol" className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {c.processes.steps.map((s, i) => (
                <StaggerItem as="li" key={s.title} className="relative border-t border-white/15 pt-8">
                  <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-cyan" aria-hidden="true" />
                  <span className="tabular font-display text-sm font-semibold text-cyan">Step {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 font-display text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-silver/70">{s.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending tone="dark" label="Operational processes: from order to dispatch" className="mt-12" />
          )}
        </div>
      </section>

      <section aria-labelledby="gallery-title" className="bg-white py-24 sm:py-32">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title="Inside our operations" id="gallery-title" />
          {c.gallery.length ? (
            <Stagger as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
              {c.gallery.map((g, i) => (
                <StaggerItem as="li" key={`${g.image.url}-${i}`}>
                  <figure>
                    <div className="group aspect-[4/3] overflow-hidden bg-paper">
                      <Img src={g.image.url} alt={g.image.alt || g.caption} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    {(g.caption || g.isConceptual) && (
                      <figcaption className="mt-3 text-sm text-muted">
                        {g.caption}
                        {g.isConceptual && <ConceptualNote className="mt-1 block" />}
                      </figcaption>
                    )}
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending label="Infrastructure photographs for the gallery" className="mt-12" />
          )}
        </div>
      </section>
    </>
  );
}
