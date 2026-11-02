import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link, useLoaderData } from 'react-router';
import { HeroVideo } from '../components/HeroVideo';
import { Molecule } from '../components/motion/Molecule';
import { easePremium, Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { LineReveal } from '../components/motion/SplitText';
import { ProductCard } from '../components/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { Img } from '../components/ui/Img';
import { ConceptualNote, Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import { useSite } from '../lib/site';
import type { ContentMap } from '../lib/types';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: easePremium },
});

const accent = (line: string) =>
  line.endsWith('.') ? (
    <>
      {line.slice(0, -1)}
      <span className="text-cyan">.</span>
    </>
  ) : (
    line
  );

export default function Home() {
  const c = useLoaderData() as ContentMap['home'];
  const { products } = useSite();
  const { hero } = c;

  return (
    <>
      <Seo seo={c.seo} description={hero.supporting} />

      {/* 1 — Cinematic hero */}
      <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-white">
        <HeroVideo />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,29,43,0.88)_0%,rgba(16,29,43,0.55)_45%,rgba(16,29,43,0.15)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy to-transparent" />
        <div aria-hidden="true" className="absolute top-[12%] right-[-26%] -z-10 hidden w-[48vw] text-silver/25 lg:block">
          <Molecule units={8} delay={0.6} className="h-auto w-full" />
        </div>

        <div className="shell flex flex-1 flex-col justify-end pt-36 pb-28 sm:pb-32">
          {hero.eyebrow && (
            <motion.p {...fade(0.3)} className="eyebrow flex items-center gap-4 text-silver/70">
              <span className="h-px w-10 bg-cyan" aria-hidden="true" />
              {hero.eyebrow}
            </motion.p>
          )}
          <h1 id="hero-title" className="display mt-8 text-[clamp(2.6rem,7.6vw,8rem)]">
            <LineReveal lines={hero.headline.split('\n')} immediate delay={0.5} renderLine={accent} />
          </h1>
          {hero.supporting && (
            <motion.p {...fade(1.1)} className="mt-8 max-w-xl text-lg leading-relaxed text-silver/80 sm:text-xl">
              {hero.supporting}
            </motion.p>
          )}
          <motion.div {...fade(1.3)} className="mt-10 flex flex-wrap gap-4">
            {hero.primaryCta.href && <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>}
            {hero.secondaryCta.href && (
              <ButtonLink href={hero.secondaryCta.href} variant="onDark">
                {hero.secondaryCta.label}
              </ButtonLink>
            )}
          </motion.div>
        </div>

        {/* Product quick links along the bottom edge */}
        <motion.div {...fade(1.6)} className="border-t border-white/10">
          <div className="shell flex items-center justify-between gap-6 py-5">
            <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {products.map((p) => (
                <li key={p._id}>
                  <Link to={`/products/${p.slug}`} className="group flex items-baseline gap-2 text-silver/70 transition-colors hover:text-white">
                    <span className="font-display font-bold tracking-wide text-white">{p.code}</span>
                    <span className="hidden sm:inline">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <a href="#introduction" className="hidden items-center gap-3 text-xs text-silver/60 hover:text-white md:flex">
              <span className="relative h-8 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/3 animate-scroll-cue bg-cyan" />
              </span>
              <span className="eyebrow text-[0.6rem]">Scroll</span>
              <ArrowDown className="sr-only" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2 — Company introduction */}
      <section id="introduction" aria-labelledby="intro-title" className="bg-white py-24 sm:py-32 lg:py-40">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionHeading eyebrow={c.introduction.eyebrow} title={c.introduction.heading} id="intro-title" className="lg:col-span-7" titleClassName="text-[clamp(2.25rem,5vw,4.75rem)]" />
          <Reveal className="lg:col-span-5 lg:pt-16">
            <div className="prose-body font-display text-xl leading-snug font-medium tracking-tight text-navy/90 sm:text-2xl">
              {c.introduction.body.length ? c.introduction.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label="Company introduction" />}
            </div>
            {c.introduction.cta.href && (
              <ButtonLink href={c.introduction.cta.href} variant="secondary" className="mt-10">
                {c.introduction.cta.label}
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </section>

      {/* 3 — Product showcase */}
      <section aria-labelledby="products-title" className="bg-navy py-24 text-white sm:py-32 lg:py-40">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <SectionHeading eyebrow="Products" title={c.products.heading} id="products-title" tone="dark" className="lg:col-span-7" />
            <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
              <p className="leading-relaxed text-silver/70">{c.products.intro}</p>
              <ButtonLink href="/products" variant="onDark" className="mt-6">
                All products
              </ButtonLink>
            </Reveal>
          </div>
          <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:mt-20 lg:gap-6" gap={0.1}>
            {products.map((p, i) => (
              <StaggerItem key={p._id}>
                <ProductCard product={p} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 4 — Business strengths */}
      <section aria-labelledby="strengths-title" className="bg-paper py-24 sm:py-32 lg:py-40">
        <div className="shell">
          <SectionHeading eyebrow="Business strengths" title={c.strengths.heading} id="strengths-title" className="max-w-3xl" />
          {c.strengths.items.length ? (
            <Stagger as="ol" className="mt-16 grid border-t border-navy/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
              {c.strengths.items.map((s, i) => (
                <StaggerItem as="li" key={s.title} className="border-b border-navy/10 py-10 sm:pr-8 lg:border-r lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                  <span className="tabular font-display text-sm font-semibold text-blue">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-8 font-display text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending label="Business strengths" className="mt-12" />
          )}
        </div>
      </section>

      {/* 5 — Infrastructure preview */}
      <section aria-labelledby="infra-title" className="bg-white py-24 sm:py-32 lg:py-40">
        <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-7">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                <Img src={c.infrastructure.image.url} alt={c.infrastructure.image.alt} sizes="(min-width: 1024px) 55vw, 100vw" className="h-full w-full object-contain p-6" />
              </div>
              {c.infrastructure.imageIsConceptual && (
                <figcaption className="mt-3">
                  <ConceptualNote />
                </figcaption>
              )}
            </figure>
          </Reveal>
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Infrastructure" title={c.infrastructure.heading} id="infra-title" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            <Reveal delay={0.1} className="mt-6">
              {c.infrastructure.body ? <p className="leading-relaxed text-muted">{c.infrastructure.body}</p> : <Pending label="Infrastructure overview: storage, handling and distribution capability" />}
              {c.infrastructure.cta.href && (
                <ButtonLink href={c.infrastructure.cta.href} variant="secondary" className="mt-8">
                  {c.infrastructure.cta.label}
                </ButtonLink>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Quality commitment */}
      <section aria-labelledby="quality-title" className="relative isolate overflow-hidden bg-industrial py-24 text-white sm:py-32 lg:py-40">
        <div aria-hidden="true" className="absolute -bottom-20 left-[-15%] -z-10 w-[80vw] text-white/10 lg:w-[45vw]">
          <Molecule units={7} immediate={false} className="h-auto w-full" />
        </div>
        <div className="shell grid gap-12 lg:grid-cols-12">
          <SectionHeading eyebrow="Quality commitment" title={c.quality.heading} id="quality-title" tone="dark" className="lg:col-span-6" />
          <Reveal delay={0.1} className="lg:col-span-6 lg:pt-14">
            {c.quality.body ? <p className="text-lg leading-relaxed text-silver/80">{c.quality.body}</p> : <Pending tone="dark" label="Quality commitment statement" />}
            {c.quality.points.length > 0 && (
              <ul className="mt-8 space-y-3">
                {c.quality.points.map((p) => (
                  <li key={p} className="flex gap-3 text-silver/85">
                    <span className="mt-[0.7em] h-px w-5 shrink-0 bg-cyan" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {c.quality.cta.href && (
              <ButtonLink href={c.quality.cta.href} variant="onDark" className="mt-10">
                {c.quality.cta.label}
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </section>

      {/* 7 — B2B inquiry CTA */}
      <section aria-labelledby="cta-title" className="bg-cyan py-20 sm:py-28">
        <div className="shell flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 id="cta-title" className="display text-[clamp(2.4rem,5.5vw,5rem)] text-navy">
              <LineReveal lines={[c.inquiry.heading]} />
            </h2>
            {c.inquiry.body && (
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy/75">{c.inquiry.body}</p>
              </Reveal>
            )}
          </div>
          {c.inquiry.cta.href && (
            <Reveal delay={0.2}>
              <ButtonLink href={c.inquiry.cta.href} variant="secondary" className="!border-navy !bg-navy !text-white hover:!bg-white hover:!text-navy">
                {c.inquiry.cta.label}
              </ButtonLink>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
