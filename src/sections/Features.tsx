import {
  Bot,
  DatabaseBackup,
  FileSearch,
  Gauge,
  LayoutPanelTop,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  Rocket,
  Search,
  ShieldCheck,
  SquarePen,
  type LucideIcon,
} from 'lucide-react';
import { Stagger, StaggerItem } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { features } from '../content/proposal';
import { pad2 } from '../lib/format';
import { sectionNumber } from '../lib/sections';

const icons: Record<(typeof features.items)[number]['icon'], LucideIcon> = {
  responsive: MonitorSmartphone,
  cms: LayoutPanelTop,
  auth: LockKeyhole,
  seo: Search,
  sitemap: Network,
  robots: Bot,
  meta: FileSearch,
  ssl: ShieldCheck,
  performance: Gauge,
  forms: SquarePen,
  backup: DatabaseBackup,
  deploy: Rocket,
};

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="bg-blue py-24 text-white sm:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          number={sectionNumber('features')}
          label="Technical Features"
          title={features.heading}
          headingId="features-title"
          tone="blue"
          intro={features.intro}
          className="max-w-4xl"
        />

        <Stagger as="ul" gap={0.05} className="mt-16 grid border-t border-l border-white/15 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {features.items.map((f, i) => {
            const Icon = icons[f.icon];
            return (
              <StaggerItem as="li" key={f.title} className="group relative border-r border-b border-white/15 p-6 transition-colors duration-500 hover:bg-white/[0.06] sm:p-8">
                <div className="flex items-start justify-between">
                  <Icon className="h-7 w-7 transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.25} aria-hidden="true" />
                  <span className="tabular text-xs text-white/50">{pad2(i + 1)}</span>
                </div>
                <h3 className="mt-10 font-display text-lg leading-snug font-semibold tracking-tight sm:mt-14">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{f.text}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
