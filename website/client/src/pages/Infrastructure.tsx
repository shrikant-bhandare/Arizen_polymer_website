import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useLoaderData } from 'react-router';
import { easePremium, Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { ProcessFlow, type FlowStep } from '../components/process/ProcessFlow';
import { Img } from '../components/ui/Img';
import { PageHero } from '../components/ui/PageHero';
import { ConceptualNote, Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import type { ContentMap } from '../lib/types';

type Section = ContentMap['infrastructure']['facilities'];

/**
 * General industry overview, shown (and labelled as such) until Arizen enters its own
 * operational steps in the dashboard. It describes how polymer granules are typically
 * made, not Arizen's specific operations.
 */
const typicalProcess: FlowStep[] = [
  { icon: 'raw', output: 'resin', title: 'Raw material', text: 'Polymer resin and additives are received, checked and kept dry.' },
  { icon: 'blend', output: 'blend', title: 'Blending', text: 'Resin, colour and additives are weighed and mixed to the recipe.' },
  { icon: 'extrude', output: 'melt', title: 'Melt extrusion', text: 'A heated screw melts and mixes the blend, then pushes it out as strands.' },
  { icon: 'cool', output: 'strand', title: 'Cooling', text: 'The strands pass through a water bath and harden.' },
  { icon: 'pelletise', output: 'pellet', title: 'Pelletising', text: 'A rotating cutter chops the strands into uniform granules.' },
  { icon: 'test', output: 'pellet', title: 'Quality testing', text: 'Samples are tested for properties such as melt flow and impact strength.' },
  { icon: 'pack', title: 'Packing & dispatch', text: 'Granules are bagged, labelled and sent out to customers.' },
];

/** Image that wipes open from its outer edge, then drifts gently against the scroll. */
function RevealFigure({ fromRight, children }: { fromRight: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-5%', '5%']);
  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      initial={{ clipPath: fromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.2, ease: easePremium }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={{ scale: 1.22 }}
        whileInView={{ scale: 1.1 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 1.6, ease: easePremium }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ImageSection({ section, index, eyebrow }: { section: Section; index: number; eyebrow: string }) {
  const flip = index % 2 === 1;
  return (
    <section aria-label={section.heading} className={`py-20 sm:py-28 ${flip ? 'bg-paper' : 'bg-white'}`}>
      <div className={`shell grid items-center gap-12 lg:grid-cols-12 lg:gap-20`}>
        <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <figure>
            <div className={`relative aspect-[4/3] overflow-hidden ${flip ? 'bg-white' : 'bg-paper'}`}>
              {section.image.url ? (
                <RevealFigure fromRight={flip}>
                  <Img src={section.image.url} alt={section.image.alt} sizes="(min-width: 1024px) 55vw, 100vw" className={`h-full w-full ${section.imageIsConceptual ? 'object-contain p-8' : 'object-cover'}`} />
                </RevealFigure>
              ) : (
                <div className="grid h-full place-items-center p-8">
                  <Pending label={`${section.heading}: photograph`} />
                </div>
              )}
            </div>
            {section.imageIsConceptual && section.image.url && (
              <Reveal delay={0.4} y={8}>
                <figcaption className="mt-3">
                  <ConceptualNote />
                </figcaption>
              </Reveal>
            )}
          </figure>
        </div>
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
  const ownSteps = c.processes.steps.length > 0;

  return (
    <>
      <Seo title="Infrastructure" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="Infrastructure" title={c.heading} intro={c.intro || undefined} crumbs={[{ label: 'Infrastructure' }]}>
        {!c.intro && <Pending tone="dark" label="Infrastructure introduction" className="mt-8 max-w-xl" />}
      </PageHero>

      {sections.map(([s, eyebrow], i) => (
        <ImageSection key={eyebrow} section={s} index={i} eyebrow={eyebrow} />
      ))}

      <section aria-labelledby="process-title" className="relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_0%,rgba(40,104,160,0.35),transparent_70%)]" />
        <div className="shell relative">
          {ownSteps ? (
            <SectionHeading eyebrow="Operations" title={c.processes.heading} id="process-title" tone="dark" />
          ) : (
            <SectionHeading
              eyebrow="Making process"
              title="How polymer granules are made"
              id="process-title"
              tone="dark"
              intro="Follow one batch down the line: resin is blended, melted, drawn into strands, cooled, cut into granules, tested and packed."
            />
          )}
          <div className="mt-12">
            <ProcessFlow steps={ownSteps ? c.processes.steps : typicalProcess} label={ownSteps ? c.processes.heading : 'Typical polymer granule process'} />
          </div>
          {!ownSteps && (
            <p className="mt-12 flex items-center gap-3 text-xs tracking-wide text-white/65">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              A typical industry process, shown for illustration. Arizen’s own operational steps will be published here once confirmed.
            </p>
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
