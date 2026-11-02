import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import { easePremium, Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { timeline } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

const last = timeline.stages.length - 1;

export function Timeline() {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [scrolledTo, setScrolledTo] = useState(-1);

  // The line draws as the timeline moves through the viewport; milestones light up as it passes them.
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 0.85', 'end 0.45'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });
  useMotionValueEvent(progress, 'change', (v) => {
    setScrolledTo(Math.min(last, Math.floor(v * last + 0.02)));
  });
  const reached = reduce ? last : scrolledTo;
  const lineScale = reduce ? 1 : progress;

  const stage = timeline.stages[selected];

  return (
    <section id="timeline" aria-labelledby="timeline-title" className="relative overflow-hidden bg-navy py-24 text-white sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            number={sectionNumber('timeline')}
            label="Project Timeline"
            title={timeline.heading}
            headingId="timeline-title"
            tone="dark"
            className="lg:col-span-8"
          />
          <Reveal delay={0.1} className="lg:col-span-4 lg:text-right">
            <p className="eyebrow text-silver/50">Estimated duration</p>
            <p className="mt-3 font-display text-5xl font-extrabold tracking-tight whitespace-nowrap sm:text-6xl">{timeline.durationRange}</p>
            <p className="mt-1 text-silver/60">{timeline.durationUnit}</p>
          </Reveal>
        </div>

        <div ref={track} className="relative mt-16 lg:mt-24">
          {/* Desktop: horizontal track */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute top-[22px] right-[10%] left-[10%] h-px bg-white/10" aria-hidden="true" />
              <motion.div className="absolute top-[22px] right-[10%] left-[10%] h-px origin-left bg-cyan" style={{ scaleX: lineScale }} aria-hidden="true" />
              <ol className="relative grid grid-cols-5">
                {timeline.stages.map((s, i) => {
                  const lit = i <= reached;
                  const active = i === selected;
                  return (
                    <li key={s.title} className="px-3 text-center">
                      <button type="button" onClick={() => setSelected(i)} aria-pressed={active} className="group flex w-full flex-col items-center">
                        <span
                          className={`tabular relative grid h-11 w-11 place-items-center rounded-full border font-display text-sm font-semibold transition-all duration-500 ${
                            lit ? 'border-cyan bg-navy text-cyan' : 'border-white/20 bg-navy text-white/40'
                          } ${active ? '!bg-cyan !text-navy' : ''}`}
                        >
                          {pad2(i + 1)}
                          {active && <motion.span layoutId="timeline-ring" className="absolute -inset-2 rounded-full border border-cyan/40" transition={{ duration: 0.5, ease: easePremium }} />}
                        </span>
                        <span className={`mt-6 font-display text-sm font-semibold transition-colors ${lit ? 'text-cyan' : 'text-white/40'}`}>{s.days}</span>
                        <span className={`mt-2 max-w-[14rem] font-display text-lg leading-snug font-semibold tracking-tight transition-colors ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                          {s.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-14 grid grid-cols-12 border-t border-white/10 pt-10" aria-live="polite">
              <p className="eyebrow col-span-3 text-cyan">Stage {pad2(selected + 1)} · {stage.days}</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={selected}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                  className="col-span-9 max-w-3xl text-xl leading-relaxed text-silver/85"
                >
                  {stage.detail}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile & tablet: vertical track with every detail visible */}
          <ol className="relative lg:hidden">
            <span className="absolute top-2 bottom-2 left-[21px] w-px bg-white/10" aria-hidden="true" />
            <motion.span className="absolute top-2 bottom-2 left-[21px] w-px origin-top bg-cyan" style={{ scaleY: lineScale }} aria-hidden="true" />
            {timeline.stages.map((s, i) => {
              const lit = i <= reached;
              return (
                <li key={s.title} className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-12 last:pb-0">
                  <span
                    className={`tabular relative grid h-11 w-11 place-items-center rounded-full border bg-navy font-display text-sm font-semibold transition-colors duration-500 ${
                      lit ? 'border-cyan text-cyan' : 'border-white/20 text-white/40'
                    }`}
                  >
                    {pad2(i + 1)}
                  </span>
                  <div className="pt-1">
                    <p className={`font-display text-sm font-semibold transition-colors ${lit ? 'text-cyan' : 'text-white/50'}`}>{s.days}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-silver/75">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
