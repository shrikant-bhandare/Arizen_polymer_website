import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { ArrowUpRight, Download, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { meta } from '../content/proposal';
import { useActiveSection, useScrolledPast } from '../lib/hooks';
import { downloadProposalPdf } from '../lib/pdf';
import { navLinks, scrollToSection, sectionNumber, sections } from '../lib/sections';
import { easePremium } from './Reveal';
import { NeureonixMark } from './Wordmark';

const sectionIds = sections.map((s) => s.id);

export function Nav() {
  const compact = useScrolledPast(40);
  const active = useActiveSection(sectionIds);
  const { scrollYProgress } = useScroll();
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    // Let the overlay start closing before scrolling so the motion reads cleanly.
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <>
      <header className="screen-only fixed inset-x-0 top-0 z-50">
        <div
          className={`border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
            compact ? 'border-white/10 bg-navy/90 backdrop-blur-md' : 'border-transparent bg-transparent'
          }`}
        >
          <nav aria-label="Proposal" className={`shell flex items-center justify-between gap-6 text-white transition-[height] duration-500 ${compact ? 'h-14' : 'h-20'}`}>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                go('top');
              }}
              className="flex items-center gap-4"
            >
              <NeureonixMark />
              <span className="hidden border-l border-white/15 pl-4 text-xs whitespace-nowrap text-silver/60 lg:inline xl:hidden 2xl:inline">Proposal {meta.proposalNo}</span>
            </a>

            <ul className="hidden items-center gap-1 xl:flex">
              {navLinks.map((link) => {
                const isActive = !!active && (link.covers as string[]).includes(active);
                return (
                  <li key={link.label}>
                    <a
                      href={`#${link.target}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(link.target);
                      }}
                      aria-current={isActive ? 'location' : undefined}
                      className={`relative block px-3 py-2 text-[0.8rem] font-medium whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-silver/60 hover:text-white'}`}
                    >
                      {link.label}
                      {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-px h-px bg-cyan" transition={{ duration: 0.5, ease: easePremium }} />}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadProposalPdf}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-3 text-[0.8rem] font-medium whitespace-nowrap transition-colors hover:border-cyan hover:text-cyan sm:px-4"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Download PDF</span>
              </button>
              <a
                href="#acceptance"
                onClick={(e) => {
                  e.preventDefault();
                  go('acceptance');
                }}
                className="hidden h-10 items-center gap-1.5 rounded-full bg-cyan whitespace-nowrap px-4 text-[0.8rem] font-semibold text-navy transition-colors hover:bg-white md:inline-flex"
              >
                Contact
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls="proposal-index"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[0.8rem] font-medium text-silver/80 transition-colors hover:text-white"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden sm:inline">Index</span>
                <span className="sr-only sm:hidden">Open proposal index</span>
              </button>
            </div>
          </nav>
          <motion.div className="h-px origin-left bg-cyan" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
        </div>
      </header>

      <AnimatePresence>{open && <IndexOverlay active={active} onClose={() => setOpen(false)} onGo={go} />}</AnimatePresence>
    </>
  );
}

function IndexOverlay({ active, onClose, onGo }: { active: string | null; onClose: () => void; onGo: (id: string) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const all = [{ id: 'top', label: 'Opening', number: '01' }, ...sections.map((s) => ({ ...s, number: sectionNumber(s.id) }))];

  return (
    <motion.div
      ref={panel}
      id="proposal-index"
      role="dialog"
      aria-modal="true"
      aria-label="Proposal index"
      className="screen-only fixed inset-0 z-[60] overflow-y-auto bg-navy text-white"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: easePremium }}
    >
      <div className="shell flex min-h-full flex-col pb-10">
        <div className="flex h-20 items-center justify-between">
          <NeureonixMark />
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-cyan hover:text-cyan"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">Close index</span>
          </button>
        </div>

        <p className="eyebrow mt-6 text-cyan">Proposal Index</p>
        <ol className="mt-6 grid gap-x-12 md:grid-cols-2">
          {all.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.03, ease: easePremium }}
              className="border-b border-white/10"
            >
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onGo(s.id);
                }}
                aria-current={active === s.id ? 'location' : undefined}
                className="group flex items-baseline gap-5 py-4 sm:py-5"
              >
                <span className={`tabular text-xs ${active === s.id ? 'text-cyan' : 'text-silver/40'}`}>{s.number}</span>
                <span className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-cyan sm:text-2xl">{s.label}</span>
              </a>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-silver/60">
          <p>
            {meta.project} · {meta.proposalNo} · {meta.date}
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              void downloadProposalPdf();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 font-medium text-white transition-colors hover:border-cyan hover:text-cyan"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}
