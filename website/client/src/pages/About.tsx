import { Leaf, Quote, Recycle } from 'lucide-react';
import { useLoaderData } from 'react-router';
import { CircularLoop } from '../components/CircularLoop';
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
            <SectionHeading eyebrow="Our journey" title={c.profile.heading} id="profile-title" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 text-lg leading-relaxed text-navy/80">
              {c.profile.body.length ? c.profile.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label="Company profile and history" />}
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading eyebrow="At a glance" title={c.overview.heading} titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
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

      {/* Journey towards sustainability */}
      <section aria-labelledby="sustainability-title" className="bg-leaf-wash py-24 sm:py-32">
        <div className="shell grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Sustainability" title={c.sustainability.heading || 'Our journey towards sustainability'} id="sustainability-title" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 text-lg leading-relaxed text-navy/80">
              {c.sustainability.body.length ? c.sustainability.body.map((p, i) => <p key={i}>{p}</p>) : <Pending label="Sustainability story" />}
            </Reveal>
          </div>
          <div className="mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8">
            <CircularLoop stages={['Recover', 'Reprocess', 'Granules', 'Manufacture']} />
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

      {/* Environmental commitment */}
      <section aria-labelledby="values-title" className="bg-white py-24 sm:py-32">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <SectionHeading eyebrow="What we stand for" title={c.values.heading} id="values-title" className="lg:col-span-6" titleClassName="text-[clamp(2rem,4vw,3.5rem)]" />
            {c.values.intro && (
              <Reveal delay={0.1} className="text-lg leading-relaxed text-muted lg:col-span-5 lg:col-start-8 lg:self-end">
                <p>{c.values.intro}</p>
              </Reveal>
            )}
          </div>
          {c.values.items.length ? (
            <Stagger as="ol" className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {c.values.items.map((it, i) => (
                <StaggerItem as="li" key={it.title} className="border-t border-navy/10 py-8">
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf-wash text-leaf">
                      <Leaf className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="tabular font-display text-sm font-semibold text-leaf">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{it.title}</h3>
                  {it.text && <p className="mt-2 leading-relaxed text-muted">{it.text}</p>}
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Pending label="Environmental commitments" className="mt-10" />
          )}
          {c.values.note && (
            <Reveal className="mt-10 flex max-w-3xl gap-4 border-t-2 border-leaf pt-6">
              <Recycle className="mt-1 h-5 w-5 shrink-0 text-leaf" aria-hidden="true" />
              <p className="leading-relaxed text-navy/80">{c.values.note}</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* Commitment to customers */}
      <section aria-labelledby="approach-title" className="bg-paper py-24 sm:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Our customers" title={c.approach.heading} id="approach-title" titleClassName="text-[clamp(2rem,3.6vw,3.25rem)]" />
            {c.approach.intro && (
              <Reveal delay={0.1} className="mt-8 text-lg leading-relaxed text-navy/80">
                <p>{c.approach.intro}</p>
              </Reveal>
            )}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <NumberedItems items={c.approach.items} label="Commitment to customers" />
          </div>
        </div>
      </section>

      {/* Closing statement */}
      {(c.closing.heading || c.closing.body.length > 0) && (
        <section aria-labelledby="closing-title" className="relative overflow-hidden bg-industrial py-24 text-white sm:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_90%_10%,rgba(124,207,91,0.22),transparent_70%)]" />
          <div className="shell relative max-w-5xl">
            <SectionHeading eyebrow="A greener tomorrow" title={c.closing.heading} id="closing-title" tone="dark" titleClassName="text-[clamp(2.25rem,5vw,4.25rem)]" />
            <Reveal delay={0.1} className="prose-body mt-8 max-w-3xl text-lg leading-relaxed text-silver/80">
              {c.closing.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>
            {c.closing.signoff && (
              <Reveal delay={0.2} className="mt-12 border-t border-white/10 pt-8">
                <p className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold tracking-tight text-leaf-bright">{c.closing.signoff}</p>
                <p className="mt-2 text-sm text-silver/65">Arizen Polymers India Private Limited</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

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
