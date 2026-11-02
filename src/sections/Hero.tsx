import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { accentStop } from '../components/Accent';
import { Molecule } from '../components/Molecule';
import { ParticleField } from '../components/ParticleField';
import { easePremium } from '../components/Reveal';
import { LineReveal, SplitText } from '../components/SplitText';
import { hero, meta } from '../content/proposal';
import { scrollToSection } from '../lib/sections';

const fade = (delay: number, y = 16) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: easePremium },
});

export function Hero() {
  return (
    <motion.section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Atmosphere: one restrained light pool, Swiss grid hairlines, particles, molecules. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_78%_38%,rgba(40,100,168,0.28),transparent_70%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/6)_100%]"
      />
      <ParticleField className="absolute inset-0 -z-10 h-full w-full" />

      <div aria-hidden="true" className="absolute top-[14%] right-[-30%] -z-10 w-[120vw] text-silver/30 sm:right-[-12%] sm:w-[85vw] lg:top-[16%] lg:right-[-4%] lg:w-[58vw] lg:text-silver/45">
        <div className="animate-drift">
          <Molecule units={9} delay={0.3} className="h-auto w-full" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-[9%] left-[-6%] -z-10 hidden w-[26vw] text-silver/20 md:block">
        <Molecule units={8} rings={false} delay={0.9} className="h-auto w-full" />
      </div>

      <div className="shell flex flex-1 flex-col justify-end pt-32 pb-24 sm:pb-28">
        <div className="flex items-center gap-3 text-white/90">
          <motion.span {...fade(0.7, 0)} className="h-px w-8 bg-cyan" aria-hidden="true" />
          <SplitText text="ARIZEN POLYMERS" immediate delay={0.8} stagger={0.045} className="font-display text-sm font-semibold tracking-[0.42em] sm:text-base" />
        </div>
        <motion.p {...fade(1.2)} className="eyebrow mt-4 text-silver/55">
          {hero.eyebrow}
        </motion.p>

        <h1 id="hero-title" className="display mt-8 max-w-[14ch] text-[clamp(2.75rem,9.2vw,9.5rem)]">
          <LineReveal lines={hero.headline} immediate delay={1.3} renderLine={accentStop} />
        </h1>

        <motion.p {...fade(1.9)} className="mt-8 max-w-xl text-base leading-relaxed text-silver/75 sm:text-lg">
          {hero.supporting}
        </motion.p>

        <motion.div {...fade(2.1)} className="mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
            {[
              ['Prepared by', meta.preparedBy],
              ['Proposal No.', meta.proposalNo],
              ['Date', meta.date],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow text-silver/45">{label}</dt>
                <dd className="mt-2 font-display text-[0.95rem] font-semibold tracking-tight text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={() => scrollToSection('introduction')}
            className="group inline-flex items-center gap-4 self-start text-left md:self-end"
          >
            <span className="font-display text-sm font-semibold tracking-wide">Explore Proposal</span>
            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/25 transition-all duration-500 group-hover:border-cyan group-hover:bg-cyan group-hover:text-navy">
              <ArrowDown className="h-5 w-5 transition-transform duration-500 group-hover:translate-y-0.5" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </button>
        </motion.div>
      </div>

      <motion.div {...fade(2.6, 0)} aria-hidden="true" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="eyebrow text-[0.6rem] text-silver/40">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-scroll-cue bg-cyan" />
        </span>
      </motion.div>
    </motion.section>
  );
}
