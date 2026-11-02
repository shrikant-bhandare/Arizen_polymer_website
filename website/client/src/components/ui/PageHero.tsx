import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Molecule } from '../motion/Molecule';
import { easePremium } from '../motion/Reveal';
import { LineReveal } from '../motion/SplitText';

interface Props {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

/** Dark opening band for inner pages: breadcrumb, headline, introduction and a drawn molecule. */
export function PageHero({ eyebrow, title, intro, crumbs = [], children }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-navy pt-36 pb-20 text-white sm:pt-44 sm:pb-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_85%_30%,rgba(40,104,160,0.35),transparent_70%)]" />
      <div aria-hidden="true" className="absolute top-24 right-[-30%] -z-10 w-[110vw] text-silver/20 sm:right-[-10%] sm:w-[70vw] lg:right-[-2%] lg:w-[46vw]">
        <div className="animate-drift">
          <Molecule units={9} delay={0.2} className="h-auto w-full" />
        </div>
      </div>
      <div className="shell">
        {crumbs.length > 0 && (
          <motion.nav aria-label="Breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-silver/65">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  {c.href ? (
                    <Link to={c.href} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-silver/80">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </motion.nav>
        )}
        <motion.p
          className="eyebrow mt-10 flex items-center gap-4 text-cyan"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: easePremium }}
        >
          <span className="h-px w-10 bg-cyan/50" aria-hidden="true" />
          {eyebrow}
        </motion.p>
        <h1 className="display mt-6 max-w-5xl text-[clamp(2.6rem,7vw,6.5rem)]">
          <LineReveal lines={title.split('\n')} immediate delay={0.2} />
        </h1>
        {intro && (
          <motion.div
            className="mt-8 max-w-2xl text-lg leading-relaxed text-silver/75"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: easePremium }}
          >
            {intro}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
