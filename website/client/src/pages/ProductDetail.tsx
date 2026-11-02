import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';
import { useRef } from 'react';
import { Link, useLoaderData } from 'react-router';
import { easePremium, Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { LineReveal } from '../components/motion/SplitText';
import { ProductCard } from '../components/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { Img } from '../components/ui/Img';
import { Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import type { Product } from '../lib/types';

export default function ProductDetail() {
  const p = useLoaderData() as Product;
  const hero = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '12%']);
  const quoteHref = `/request-quote?product=${encodeURIComponent(p.slug)}`;

  return (
    <>
      <Seo title={`${p.name} (${p.code})`} seo={p.seo} description={p.summary} image={p.image.url} />

      <section ref={hero} aria-labelledby="product-title" className="relative isolate overflow-hidden bg-navy pt-32 text-white sm:pt-40">
        <div className="shell grid gap-12 pb-16 lg:grid-cols-12 lg:items-end lg:pb-24">
          <div className="lg:col-span-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-silver/65">
                <li>
                  <Link to="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  <Link to="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  <span aria-current="page" className="text-silver/80">
                    {p.code}
                  </span>
                </li>
              </ol>
            </nav>
            {p.category && (
              <motion.p className="eyebrow mt-10 text-cyan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                {p.category.name}
              </motion.p>
            )}
            <h1 id="product-title" className="mt-5">
              <span className="display block text-[clamp(4.5rem,13vw,11rem)] leading-[0.85] tracking-[-0.05em]">
                <LineReveal lines={[p.code]} immediate delay={0.15} />
              </span>
              <motion.span className="mt-5 block font-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold tracking-tight" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: easePremium }}>
                {p.name}
              </motion.span>
            </h1>
            {p.tagline && (
              <motion.p className="mt-5 max-w-lg text-lg leading-relaxed text-silver/75" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: easePremium }}>
                {p.tagline}
              </motion.p>
            )}
            <motion.div className="mt-10 flex flex-wrap gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8, ease: easePremium }}>
              <ButtonLink href={quoteHref}>Request a Quote</ButtonLink>
              <ButtonLink href="#specifications" variant="onDark">
                Specifications
              </ButtonLink>
            </motion.div>
          </div>
          <motion.div
            className="relative aspect-[4/3] overflow-hidden lg:col-span-6"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 1.3, delay: 0.2, ease: easePremium }}
          >
            <motion.div style={{ y: imageY }} className="absolute inset-0 scale-110">
              <Img src={p.image.url} alt={p.image.alt || p.name} priority sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section aria-labelledby="overview-title" className="bg-white py-24 sm:py-32">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <SectionHeading eyebrow="Overview" title={`About ${p.code}`} id="overview-title" className="lg:col-span-4" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
          <Reveal delay={0.1} className="prose-body text-lg leading-relaxed text-navy/80 lg:col-span-7 lg:col-start-6">
            {p.description.length ? p.description.map((d, i) => <p key={i}>{d}</p>) : <Pending label="Product description" />}
          </Reveal>
        </div>
      </section>

      {/* Specifications */}
      <section id="specifications" aria-labelledby="spec-title" className="scroll-mt-20 bg-paper py-24 sm:py-32">
        <div className="shell">
          <SectionHeading eyebrow="Technical data" title="Technical specifications" id="spec-title" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
          {p.specifications.length ? (
            <Reveal delay={0.1} className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <caption className="sr-only">Technical specifications for {p.name}</caption>
                <thead>
                  <tr className="border-b-2 border-navy text-xs tracking-wide text-muted uppercase">
                    <th scope="col" className="py-3 pr-6 font-semibold">Property</th>
                    <th scope="col" className="py-3 pr-6 font-semibold">Value</th>
                    <th scope="col" className="py-3 pr-6 font-semibold">Unit</th>
                    <th scope="col" className="py-3 font-semibold">Test method</th>
                  </tr>
                </thead>
                <tbody>
                  {p.specifications.map((s) => (
                    <tr key={s.property} className="border-b border-navy/10">
                      <th scope="row" className="py-4 pr-6 font-display font-semibold">{s.property}</th>
                      <td className="tabular py-4 pr-6">{s.value}</td>
                      <td className="py-4 pr-6 text-muted">{s.unit || '—'}</td>
                      <td className="py-4 text-muted">{s.testMethod || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          ) : (
            <Reveal delay={0.1} className="mt-12 flex flex-col gap-6 border border-navy/10 bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <FileText className="mt-1 h-6 w-6 shrink-0 text-blue" strokeWidth={1.5} aria-hidden="true" />
                <p className="max-w-2xl leading-relaxed text-muted">{p.specificationsNote || 'Technical specifications are available on request.'}</p>
              </div>
              <ButtonLink href={quoteHref} variant="secondary" className="shrink-0">
                Request data sheet
              </ButtonLink>
            </Reveal>
          )}
          {p.specifications.length > 0 && p.specificationsNote && <p className="mt-6 max-w-2xl text-sm text-muted">{p.specificationsNote}</p>}
        </div>
      </section>

      {/* Grades & applications */}
      <section aria-label="Grades and applications" className="bg-white py-24 sm:py-32">
        <div className="shell grid gap-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Grades" title="Available grades" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            {p.grades.length ? (
              <Stagger as="ul" className="mt-10 border-t border-navy/10">
                {p.grades.map((g) => (
                  <StaggerItem as="li" key={g.name} className="border-b border-navy/10 py-6">
                    <p className="font-display text-xl font-bold tracking-tight">{g.name}</p>
                    {g.description && <p className="mt-1.5 leading-relaxed text-muted">{g.description}</p>}
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <Pending label={`Available ${p.code} grades`} className="mt-10" />
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Applications" title="Typical applications" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            {p.applications.length ? (
              <Stagger as="ul" className="mt-10 flex flex-wrap gap-3" gap={0.05}>
                {p.applications.map((a) => (
                  <StaggerItem as="li" key={a} className="border border-navy/15 px-4 py-2.5 text-sm font-medium transition-colors hover:border-blue hover:text-blue">
                    {a}
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <Pending label="Applications" className="mt-10" />
            )}
            <p className="mt-6 text-xs leading-relaxed text-muted">Typical uses for this material class. Suitability for a specific application depends on the grade; please confirm with the Arizen team.</p>
          </div>
        </div>
      </section>

      {/* Inquiry CTA */}
      <section aria-labelledby="product-cta" className="bg-cyan py-16 sm:py-20">
        <div className="shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 id="product-cta" className="display max-w-2xl text-[clamp(2rem,4vw,3.5rem)] text-navy">
            Need {p.code} for your next production run?
          </h2>
          <ButtonLink href={quoteHref} variant="secondary" className="!border-navy !bg-navy !text-white hover:!bg-white hover:!text-navy">
            Request a Quote for {p.code}
          </ButtonLink>
        </div>
      </section>

      {/* Related */}
      {p.related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-navy py-24 text-white sm:py-32">
          <div className="shell">
            <SectionHeading eyebrow="Explore more" title="Related products" id="related-title" tone="dark" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            <Stagger className="mt-14 grid gap-5 md:grid-cols-3" gap={0.1}>
              {p.related.map((r, i) => (
                <StaggerItem key={r._id}>
                  <ProductCard product={r} index={i} sizes="(min-width: 768px) 30vw, 100vw" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
