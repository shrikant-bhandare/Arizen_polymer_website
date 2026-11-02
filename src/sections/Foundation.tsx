import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { easePremium, Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { architecture } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

type LayerId = (typeof architecture.layers)[number]['id'];

function Connector({ delay = 0 }: { delay?: number }) {
  return (
    <div aria-hidden="true" className="relative mx-auto h-8 w-px overflow-hidden">
      <motion.span
        className="absolute inset-0 origin-top bg-white/35"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: easePremium }}
      />
      <span className="absolute inset-x-0 top-0 h-2 animate-flow bg-cyan" style={{ animationDelay: `${delay}s` }} />
    </div>
  );
}

interface LayerButtonProps {
  id: LayerId;
  selected: LayerId;
  onSelect: (id: LayerId) => void;
}

const layerTitle = (id: LayerId) => architecture.layers.find((l) => l.id === id)!.title;

function Block({ id, selected, onSelect }: LayerButtonProps) {
  const active = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`relative w-full px-3 py-4 text-center font-display text-sm font-semibold tracking-tight transition-all duration-500 sm:px-4 sm:text-[0.95rem] ${
        active ? 'bg-cyan text-navy' : 'border border-white/15 text-white/85 hover:border-cyan/60 hover:text-white'
      }`}
    >
      {layerTitle(id)}
    </button>
  );
}

function Rail({ id, selected, onSelect }: LayerButtonProps) {
  const active = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`flex items-center justify-center py-4 font-display text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-500 [writing-mode:vertical-rl] ${
        active ? 'bg-cyan text-navy' : 'border border-dashed border-white/20 text-white/60 hover:border-cyan/60 hover:text-white'
      }`}
    >
      <span className="rotate-180">{layerTitle(id)}</span>
    </button>
  );
}

export function Foundation() {
  const [selected, setSelected] = useState<LayerId>('frontend');
  const current = architecture.layers.find((l) => l.id === selected)!;
  const pick = { selected, onSelect: setSelected };

  return (
    <section id="foundation" aria-labelledby="foundation-title" className="bg-graphite py-24 text-white sm:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          number={sectionNumber('foundation')}
          label="Infrastructure & Experience"
          title={architecture.heading}
          headingId="foundation-title"
          tone="dark"
          intro={architecture.intro}
          className="max-w-4xl"
        />

        <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <ul className="border-t border-white/10">
              {architecture.layers.map((layer, i) => {
                const active = selected === layer.id;
                return (
                  <li key={layer.id} className="border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelected(layer.id)}
                      aria-pressed={active}
                      className="group flex w-full items-baseline gap-5 py-4 text-left"
                    >
                      <span className={`tabular text-xs transition-colors ${active ? 'text-cyan' : 'text-white/40'}`}>{pad2(i + 1)}</span>
                      <span className={`font-display text-lg font-semibold tracking-tight transition-colors ${active ? 'text-white' : 'text-white/55 group-hover:text-white'}`}>
                        {layer.title}
                      </span>
                      {active && <motion.span layoutId="foundation-marker" className="ml-auto h-px w-8 self-center bg-cyan" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 min-h-[9.5rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                >
                  <p className="eyebrow text-cyan">Proposed · {current.title}</p>
                  <p className="mt-4 text-lg leading-relaxed text-silver/85">{current.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-7">
            <figure aria-label="Proposed website architecture">
              <div className="grid grid-cols-[2.25rem_1fr_2.25rem] gap-3 sm:grid-cols-[2.75rem_1fr_2.75rem] sm:gap-4">
                <Rail id="seo" {...pick} />
                <div>
                  <p className="mx-auto w-fit rounded-full border border-white/15 px-4 py-2 text-center text-xs text-silver/70">Visitors &amp; industrial buyers</p>
                  <Connector />
                  <Block id="frontend" {...pick} />
                  <div className="grid grid-cols-2 gap-3">
                    <Connector delay={0.2} />
                    <Connector delay={0.3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Block id="products" {...pick} />
                    <Block id="inquiry" {...pick} />
                  </div>
                  <Connector delay={0.4} />
                  <Block id="backend" {...pick} />
                  <Connector delay={0.5} />
                  <Block id="cms" {...pick} />
                  <Connector delay={0.6} />
                  <p className="mx-auto w-fit rounded-full border border-white/15 px-4 py-2 text-center text-xs text-silver/70">Arizen administrators</p>
                </div>
                <Rail id="security" {...pick} />
              </div>
              <figcaption className="mt-6 text-xs text-silver/50">Select any layer to see what it covers. Indicative architecture of the proposed build.</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
