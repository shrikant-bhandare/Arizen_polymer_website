import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router';
import type { ProductCard as Card } from '../lib/types';
import { easePremium } from './motion/Reveal';
import { Img } from './ui/Img';

interface Props {
  product: Card;
  index: number;
  tone?: 'light' | 'dark';
  sizes?: string;
}

/** Image-led product card: masked image reveal, slow parallax, zoom and border on hover. */
export function ProductCard({ product, index, tone = 'dark', sizes = '(min-width: 1024px) 45vw, 100vw' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);
  const dark = tone === 'dark';

  return (
    <Link
      ref={ref}
      to={`/products/${product.slug}`}
      viewTransition
      className={`group relative flex h-full flex-col border transition-colors duration-500 ${dark ? 'border-white/10 bg-industrial hover:border-cyan/50' : 'border-navy/10 bg-white hover:border-blue/40'}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-cyan transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-x-100" />
      <motion.div
        className="relative aspect-[4/3] overflow-hidden"
        initial={{ clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 1.2, delay: (index % 2) * 0.12, ease: easePremium }}
      >
        <motion.div style={{ y }} className="absolute inset-0 scale-[1.14] transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-[1.2]">
          <Img src={product.image.url} alt={product.image.alt || product.name} sizes={sizes} className="h-full w-full object-cover" />
        </motion.div>
        <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${dark ? 'from-industrial' : 'from-white'} via-transparent to-transparent`} />
        <span className={`tabular absolute top-5 left-5 font-display text-xs font-semibold tracking-[0.2em] ${dark ? 'text-white/80' : 'text-navy/70'}`}>{String(index + 1).padStart(2, '0')}</span>
      </motion.div>
      <div className="relative -mt-14 flex flex-1 flex-col p-6 sm:p-8">
        <p className={`font-display text-[clamp(2.75rem,5vw,4.25rem)] leading-none font-extrabold tracking-[-0.04em] ${dark ? 'text-white' : 'text-navy'}`}>{product.code}</p>
        <h3 className={`mt-3 font-display text-lg font-semibold tracking-tight ${dark ? 'text-cyan' : 'text-blue'}`}>{product.name}</h3>
        {product.summary && <p className={`mt-3 max-w-md leading-relaxed ${dark ? 'text-silver/70' : 'text-muted'}`}>{product.summary}</p>}
        <span aria-hidden="true" className="min-h-8 flex-1" />
        <span className={`flex items-center justify-between border-t pt-5 text-sm font-semibold ${dark ? 'border-white/10 text-white' : 'border-navy/10 text-navy'}`}>
          View product
          <span className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-500 group-hover:rotate-45 ${dark ? 'border-white/20 group-hover:border-cyan group-hover:bg-cyan group-hover:text-navy' : 'border-navy/15 group-hover:border-navy group-hover:bg-navy group-hover:text-white'}`}>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </div>
    </Link>
  );
}
