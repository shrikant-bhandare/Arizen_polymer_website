import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { easePremium, Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { products, type Product } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-7%', '7%']);

  return (
    <article ref={ref} className="group relative flex w-full flex-col border border-white/10 bg-graphite transition-colors duration-500 hover:border-cyan/40">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-px origin-left scale-x-0 bg-cyan transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-x-100" />

      <motion.div
        className="relative aspect-[4/3] overflow-hidden"
        initial={{ clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.3, delay: (index % 2) * 0.15, ease: easePremium }}
      >
        <motion.img
          src={product.image}
          alt={product.imageAlt}
          width={1200}
          height={900}
          loading="lazy"
          decoding="async"
          style={{ y }}
          className="absolute inset-0 h-full w-full scale-[1.16] object-cover transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-[1.22]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/10 to-transparent" />
        <span className="tabular absolute top-5 left-5 font-display text-xs font-semibold tracking-[0.2em] text-white/80">P—{pad2(index + 1)}</span>
      </motion.div>

      <div className="relative -mt-16 flex flex-1 flex-col p-6 sm:p-8">
        <h3>
          <span className="block font-display text-[clamp(3rem,6vw,5rem)] leading-none font-extrabold tracking-[-0.04em] text-white transition-[letter-spacing] duration-700 group-hover:tracking-[-0.02em]">
            {product.code}
          </span>
          <span className="mt-3 block font-display text-lg font-semibold tracking-tight text-cyan">{product.name}</span>
        </h3>
        <p className="mt-4 max-w-md leading-relaxed text-silver/70">{product.description}</p>

        <div className="mt-auto pt-8">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-4 border-t border-white/10 pt-5 text-left text-sm font-medium text-silver/80 transition-colors hover:text-white"
          >
            On the website
            <Plus className={`h-4 w-4 shrink-0 transition-transform duration-500 ${open ? 'rotate-45 text-cyan' : ''}`} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: easePremium }}
                className="overflow-hidden"
              >
                {products.pageIncludes.map((item) => (
                  <li key={item} className="flex items-center gap-3 pt-3 text-sm text-silver/70 first:pt-4">
                    <span className="h-px w-3 bg-cyan" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}

export function Products() {
  return (
    <section id="products" aria-labelledby="products-title" className="relative bg-navy py-24 text-white sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            number={sectionNumber('products')}
            label="Product Showcase"
            title={products.heading}
            headingId="products-title"
            tone="dark"
            className="lg:col-span-7"
          />
          <Reveal delay={0.1} className="leading-relaxed text-silver/70 lg:col-span-5 lg:pb-2">
            <p>{products.intro}</p>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:mt-24 lg:gap-6" gap={0.12}>
          {products.items.map((p, i) => (
            <StaggerItem key={p.id} className="flex">
              <ProductCard product={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-8 flex items-center gap-3 text-xs text-silver/50">
          <span className="h-px w-6 bg-silver/30" aria-hidden="true" />
          {products.imageNote}
        </p>
      </div>
    </section>
  );
}
