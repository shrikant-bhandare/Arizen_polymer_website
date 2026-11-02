import { ArrowUpRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { portfolio } from '../content/proposal';
import { scrollToSection, sectionNumber } from '../lib/sections';

/**
 * Shows real references when `portfolio.items` is filled in; otherwise a clean
 * "available upon request" statement. Nothing here is ever invented.
 */
export function Portfolio() {
  const hasItems = portfolio.items.length > 0;

  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="bg-paper py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            number={sectionNumber('portfolio')}
            label="Portfolio"
            title={hasItems ? 'Selected Work.' : portfolio.heading}
            headingId="portfolio-title"
            className="lg:col-span-8"
            titleClassName="text-[clamp(2.25rem,4.6vw,4.25rem)]"
          />
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="leading-relaxed text-muted">{portfolio.text}</p>
            <button
              type="button"
              onClick={() => scrollToSection('acceptance')}
              className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-blue"
            >
              Request references
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </Reveal>
        </div>

        {hasItems && (
          <Stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.items.map((item) => (
              <StaggerItem key={item.url}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block border border-navy/10 bg-white transition-colors hover:border-blue">
                  {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />}
                  <div className="p-6">
                    <p className="font-display text-xl font-semibold tracking-tight group-hover:text-blue">{item.title}</p>
                    {item.summary && <p className="mt-2 text-sm text-muted">{item.summary}</p>}
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
