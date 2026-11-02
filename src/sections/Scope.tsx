import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PageSchematic } from '../components/PageSchematic';
import { easePremium, Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { scope } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

const featureCount = scope.areas.reduce((n, a) => n + a.items.length, 0);

export function Scope() {
  const [open, setOpen] = useState<Set<string>>(() => new Set([scope.areas[0].id]));
  const allOpen = open.size === scope.areas.length;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section id="scope" aria-labelledby="scope-title" className="bg-white py-24 sm:py-32 lg:py-40">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              number={sectionNumber('scope')}
              label={scope.heading}
              title={['Seven areas.', 'One coherent platform.']}
              headingId="scope-title"
              titleClassName="text-[clamp(2.25rem,4vw,3.75rem)]"
              intro={scope.intro}
            />
            <Reveal delay={0.2} className="mt-10 grid grid-cols-3 border-y border-navy/10 py-6">
              {[
                [6, 'Public sections'],
                [1, 'Admin dashboard'],
                [featureCount, 'Scoped features'],
              ].map(([n, label]) => (
                <div key={label}>
                  <p className="tabular font-display text-3xl font-bold tracking-tight">{n}</p>
                  <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
                </div>
              ))}
            </Reveal>
            <Reveal delay={0.25}>
              <button
                type="button"
                onClick={() => setOpen(allOpen ? new Set() : new Set(scope.areas.map((a) => a.id)))}
                className="mt-6 inline-flex h-11 items-center rounded-full border border-navy/15 px-5 text-sm font-medium transition-colors hover:border-blue hover:text-blue"
              >
                {allOpen ? 'Collapse all details' : 'Expand all details'}
              </button>
            </Reveal>
          </div>
        </div>

        <ol className="border-t border-navy/10 lg:col-span-8">
          {scope.areas.map((area, i) => {
            const isOpen = open.has(area.id);
            const panelId = `scope-panel-${area.id}`;
            return (
              <Reveal as="li" key={area.id} y={20} className="border-b border-navy/10">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(area.id)}
                    className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-7 text-left sm:grid-cols-[3.5rem_1fr_auto] sm:py-8"
                  >
                    <span className={`tabular pt-2 font-display text-sm font-semibold transition-colors ${isOpen ? 'text-blue' : 'text-muted'}`}>{pad2(i + 1)}</span>
                    <span>
                      <span className="block font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-blue sm:text-3xl">{area.title}</span>
                      <span className="mt-2 block max-w-xl text-[0.95rem] leading-relaxed text-muted">{area.summary}</span>
                    </span>
                    <span
                      className={`mt-1 grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ${
                        isOpen ? 'rotate-45 border-blue bg-blue text-white' : 'border-navy/15 group-hover:border-blue group-hover:text-blue'
                      }`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: easePremium }}
                      className="overflow-hidden"
                    >
                      <div className={`flex flex-col gap-8 pb-10 sm:pl-[4.5rem] md:flex-row md:items-start md:gap-12 ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
                        <ul className="grid flex-1 content-start gap-x-8 gap-y-3 sm:grid-cols-2">
                          {area.items.map((item) => (
                            <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed">
                              <span className="mt-[0.72em] h-px w-3 shrink-0 bg-cyan" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <figure className="w-40 shrink-0 sm:w-48">
                          <PageSchematic layout={area.layout} className="h-auto w-full drop-shadow-[0_18px_30px_rgba(16,28,44,0.12)]" />
                          <figcaption className="mt-3 text-[0.7rem] tracking-wide text-muted">Indicative layout</figcaption>
                        </figure>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
