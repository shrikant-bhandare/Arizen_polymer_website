import { Quote } from 'lucide-react';
import { useLoaderData } from 'react-router';
import { Reveal, Stagger, StaggerItem } from '../components/motion/Reveal';
import { Img } from '../components/ui/Img';
import { PageHero } from '../components/ui/PageHero';
import { Pending } from '../components/ui/Pending';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Seo } from '../components/ui/Seo';
import type { ContentMap, TitledItem } from '@shared/content';

function NumberedItems({ items, label }: { items: TitledItem[]; label: string }) {
  if (!items.length) return <Pending label={label} className="mt-10" />;
  return (
    <Stagger as="ol" className="mt-12 grid gap-x-12 sm:grid-cols-2">
      {items.map((it, i) => (
        <StaggerItem as="li" key={it.title} className="border-t border-navy/10 py-8">
          <span className="tabular font-display text-sm font-semibold text-blue">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{it.title}</h3>
          {it.text && <p className="mt-2 leading-relaxed text-muted">{it.text}</p>}
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export default function About() {
  const c = useLoaderData() as ContentMap['about'];
  const { director, team } = c;

  return (
    <>
      <Seo title="About Us" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="About Us" title={c.heading} intro={c.intro} crumbs={[{ label: 'About Us' }]} />

      {/* Profile & overview */}
      <section aria-labelledby="profile-title" className="bg-white py-24 sm:py-32">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Profile" title={c.profile.heading} id="profile-title" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 text-lg leading-relaxed text-navy/80">
              {c.profile.body.length ? c.profile.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label="Company profile and history" />}
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading eyebrow="Overview" title={c.overview.heading} titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            {c.overview.body.length > 0 && (
              <Reveal delay={0.1} className="prose-body mt-8 leading-relaxed text-muted">
                {c.overview.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </Reveal>
            )}
            {c.overview.facts.length > 0 && (
              <Reveal delay={0.15}>
                <dl className="mt-8 border-t-2 border-navy">
                  {c.overview.facts.map((f) => (
                    <div key={f.label} className="grid gap-1 border-b border-navy/10 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <dt className="eyebrow pt-1 text-muted">{f.label}</dt>
                      <dd className="font-display font-semibold tracking-tight">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Vision & mission */}
      <section aria-label="Vision and mission" className="bg-navy text-white">
        <div className="shell grid lg:grid-cols-2">
          {(
            [
              ['Vision', c.vision],
              ['Mission', c.mission],
            ] as const
          ).map(([label, text], i) => (
            <Reveal key={label} delay={i * 0.1} className={`py-20 sm:py-28 ${i === 0 ? 'lg:border-r lg:border-white/10 lg:pr-16' : 'border-t border-white/10 lg:border-t-0 lg:pl-16'}`}>
              <p className="eyebrow flex items-center gap-4 text-cyan">
                <span className="h-px w-10 bg-cyan/50" aria-hidden="true" />
                {label}
              </p>
              {text ? <p className="mt-8 font-display text-[clamp(1.6rem,2.8vw,2.4rem)] leading-snug font-semibold tracking-tight">{text}</p> : <Pending tone="dark" label={`${label} statement`} className="mt-8" />}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach & values */}
      <section aria-labelledby="approach-title" className="bg-paper py-24 sm:py-32">
        <div className="shell grid gap-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="How we work" title={c.approach.heading} id="approach-title" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            <NumberedItems items={c.approach.items} label="Business approach" />
          </div>
          <div>
            <SectionHeading eyebrow="What we stand for" title={c.values.heading} titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            <NumberedItems items={c.values.items} label="Corporate values" />
          </div>
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="team-title" className="bg-white py-24 sm:py-32">
        <div className="shell">
          <SectionHeading eyebrow="People" title={team.heading} id="team-title" intro={team.intro || undefined} />
          {team.members.length ? (
            <Stagger as="ul" className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.members.map((m) => (
                <StaggerItem as="li" key={m.name}>
                  <div className="aspect-[4/5] overflow-hidden bg-paper">
                    {m.photo.url ? <Img src={m.photo.url} alt={m.photo.alt || m.name} sizes="(min-width: 1024px) 22vw, 50vw" className="h-full w-full object-cover" /> : null}
                  </div>
                  <p className="mt-4 font-display text-lg font-bold tracking-tight">{m.name}</p>
                  <p className="text-sm text-muted">{m.role}</p>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending label="Team introduction: names, roles and photographs" className="mt-12" />
          )}
        </div>
      </section>

      {/* Director's message */}
      <section aria-labelledby="director-title" className="bg-industrial py-24 text-white sm:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-4">
            <div className="aspect-[4/5] overflow-hidden bg-navy">
              {director.photo.url ? (
                <Img src={director.photo.url} alt={director.photo.alt || director.name} sizes="(min-width: 1024px) 30vw, 100vw" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center p-8">
                  <Pending tone="dark" label="Director’s photograph" />
                </div>
              )}
            </div>
            {(director.name || director.designation) && (
              <div className="mt-5">
                {director.name ? <p className="font-display text-xl font-bold tracking-tight">{director.name}</p> : <Pending tone="dark" label="Director’s name" />}
                {director.designation && <p className="mt-1 text-sm text-silver/60">{director.designation}</p>}
              </div>
            )}
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <SectionHeading eyebrow="Leadership" title={director.heading} id="director-title" tone="dark" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            <Reveal delay={0.1} className="mt-10">
              {director.message.length ? (
                <blockquote className="relative">
                  <Quote className="absolute -top-2 -left-1 h-10 w-10 text-cyan/30" aria-hidden="true" />
                  <div className="prose-body pl-0 text-lg leading-relaxed text-silver/85 sm:pl-14">
                    {director.message.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </blockquote>
              ) : (
                <Pending tone="dark" label="Director’s message" />
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
