import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { easePremium, Reveal } from '../components/motion/Reveal';
import { ProductCard } from '../components/ProductCard';
import { PageHero } from '../components/ui/PageHero';
import { Seo } from '../components/ui/Seo';
import { useSite } from '../lib/site';
import type { ContentMap } from '../lib/types';

export default function Products() {
  const c = useLoaderData() as ContentMap['products'];
  const { products, categories } = useSite();
  const [params] = useSearchParams();
  const active = params.get('category') ?? '';
  const activeCategory = categories.find((cat) => cat.slug === active);
  const shown = activeCategory ? products.filter((p) => p.category === activeCategory._id) : products;
  const tabs = [{ slug: '', name: 'All products' }, ...categories.filter((cat) => products.some((p) => p.category === cat._id))];

  return (
    <>
      <Seo title="Products" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="Products" title={c.heading} intro={c.intro} crumbs={[{ label: 'Products' }]} />

      <section aria-label="Product catalogue" className="bg-paper py-16 sm:py-24">
        <div className="shell">
          {tabs.length > 2 && (
            <LayoutGroup>
              <nav aria-label="Product categories" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <ul className="flex w-max gap-1 border-b border-navy/10">
                  {tabs.map((t) => {
                    const isActive = t.slug === active;
                    return (
                      <li key={t.slug}>
                        <Link
                          to={t.slug ? `?category=${t.slug}` : '.'}
                          replace
                          preventScrollReset
                          aria-current={isActive ? 'page' : undefined}
                          className={`relative block px-4 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-navy' : 'text-muted hover:text-navy'}`}
                        >
                          {t.name}
                          {isActive && <motion.span layoutId="category-active" className="absolute inset-x-0 -bottom-px h-0.5 bg-blue" transition={{ duration: 0.45, ease: easePremium }} />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </LayoutGroup>
          )}
          {activeCategory?.description && (
            <Reveal key={activeCategory.slug} className="mt-8 max-w-2xl text-muted">
              <p>{activeCategory.description}</p>
            </Reveal>
          )}

          <motion.ul layout className="mt-10 grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {shown.map((p) => (
                <motion.li key={p._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: easePremium }}>
                  <ProductCard product={p} index={products.indexOf(p)} tone="light" />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          {shown.length === 0 && <p className="mt-10 text-muted">No products in this category yet.</p>}
          {c.note && <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted">{c.note}</p>}
        </div>
      </section>
    </>
  );
}
