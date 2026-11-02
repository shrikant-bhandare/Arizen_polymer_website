import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { telHref, useScrolledPast, useSite } from '../../lib/site';
import { easePremium } from '../motion/Reveal';
import { Img } from '../ui/Img';
import { Logo } from './Logo';

export function Header() {
  const { navigation, products } = useSite();
  const scrolled = useScrolledPast(24);
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const closeTimer = useRef<number>(undefined);
  const items = navigation.items.filter((i) => i.visible && i.label && i.href);

  // Close menus whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!productsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProductsOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [productsOpen]);

  const solid = scrolled || productsOpen;
  const openProducts = () => {
    window.clearTimeout(closeTimer.current);
    setProductsOpen(true);
  };
  const closeProductsSoon = () => {
    closeTimer.current = window.setTimeout(() => setProductsOpen(false), 160);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`border-b transition-[background-color,border-color,color] duration-500 ${solid ? 'border-navy/10 bg-white/95 text-navy backdrop-blur-md' : 'border-transparent bg-transparent text-white'}`}>
          <div className={`shell flex items-center justify-between gap-6 transition-[height] duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
            <Link to="/" className="shrink-0">
              <Logo tone={solid ? 'dark' : 'light'} />
              <span className="sr-only">Home</span>
            </Link>

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {items.map((item) => {
                  const isProducts = item.href === '/products';
                  return (
                    <li key={item.href} className={`relative ${isProducts ? 'mr-3' : ''}`} onMouseEnter={isProducts ? openProducts : undefined} onMouseLeave={isProducts ? closeProductsSoon : undefined}>
                      <NavLink to={item.href} end={item.href === '/'} className="group relative flex items-center gap-1 px-3 py-2 text-[0.85rem] font-medium" viewTransition>
                        {({ isActive }) => (
                          <>
                            <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'}`}>{item.label}</span>
                            {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-cyan" transition={{ duration: 0.5, ease: easePremium }} />}
                          </>
                        )}
                      </NavLink>
                      {isProducts && products.length > 0 && (
                        <button
                          type="button"
                          aria-expanded={productsOpen}
                          aria-controls="products-menu"
                          onClick={() => setProductsOpen((v) => !v)}
                          className="absolute top-1/2 -right-2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full opacity-60 hover:opacity-100"
                        >
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${productsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                          <span className="sr-only">Show products</span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/request-quote"
                viewTransition
                className={`hidden h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors duration-300 sm:inline-flex ${solid ? 'bg-navy text-white hover:bg-blue' : 'bg-cyan text-navy hover:bg-white'}`}
              >
                {navigation.ctaLabel || 'Request a Quote'}
              </Link>
              <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="mobile-menu" className="grid h-11 w-11 place-items-center rounded-full lg:hidden">
                <Menu className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {productsOpen && (
              <motion.div
                id="products-menu"
                onMouseEnter={openProducts}
                onMouseLeave={closeProductsSoon}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: easePremium }}
                className="hidden overflow-hidden border-t border-navy/10 bg-white text-navy lg:block"
              >
                <div className="shell grid grid-cols-[1fr_3fr] gap-10 py-10">
                  <div>
                    <p className="eyebrow text-blue">Products</p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">Polymer materials for industrial applications.</p>
                    <Link to="/products" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-blue">
                      View all products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                  <ul className="grid grid-cols-4 gap-5">
                    {products.map((p, i) => (
                      <motion.li key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.4 }}>
                        <Link to={`/products/${p.slug}`} className="group block">
                          <span className="block aspect-[4/3] overflow-hidden bg-paper">
                            <Img src={p.image.url} alt="" sizes="220px" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          </span>
                          <span className="mt-3 block font-display text-lg font-extrabold tracking-tight">{p.code}</span>
                          <span className="block text-sm text-muted group-hover:text-blue">{p.name}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>{menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}</AnimatePresence>
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { navigation, products, settings } = useSite();
  const panel = useRef<HTMLDivElement>(null);
  const items = navigation.items.filter((i) => i.visible && i.label && i.href);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button');
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <motion.div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] overflow-y-auto bg-navy text-white lg:hidden"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.6, ease: easePremium }}
    >
      <div className="shell flex min-h-full flex-col pb-10">
        <div className="flex h-20 items-center justify-between">
          <Logo tone="light" />
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-white/20">
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-6" onClick={(e) => (e.target as HTMLElement).closest('a') && onClose()}>
          <ul>
            {items.map((item, i) => (
              <motion.li key={item.href} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: easePremium }} className="border-b border-white/10">
                <NavLink to={item.href} end={item.href === '/'} className={({ isActive }) => `flex items-center justify-between py-4 font-display text-2xl font-bold tracking-tight ${isActive ? 'text-cyan' : ''}`}>
                  {item.label}
                </NavLink>
                {item.href === '/products' && (
                  <ul className="-mt-1 grid grid-cols-2 gap-x-4 gap-y-2 pb-4">
                    {products.map((p) => (
                      <li key={p._id}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-silver/70 hover:text-white">
                          {p.code} · {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>
        <Link to="/request-quote" onClick={onClose} className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-cyan px-6 font-semibold text-navy">
          {navigation.ctaLabel || 'Request a Quote'}
        </Link>
        <div className="mt-auto space-y-1 pt-10 text-sm text-silver/60">
          {settings.phone && (
            <a href={telHref(settings.phone)} className="block hover:text-white">
              {settings.phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="block hover:text-white">
              {settings.email}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
