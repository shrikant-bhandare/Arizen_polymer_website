import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLoaderData } from 'react-router';
import { InquiryForm } from '../components/InquiryForm';
import { Reveal } from '../components/motion/Reveal';
import { PageHero } from '../components/ui/PageHero';
import { Pending } from '../components/ui/Pending';
import { Seo } from '../components/ui/Seo';
import { telHref, useSite } from '../lib/site';
import type { ContentMap } from '../lib/types';

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-navy/10 py-6">
      <span className="mt-0.5 text-blue">{icon}</span>
      <div>
        <dt className="eyebrow text-muted">{label}</dt>
        <dd className="mt-2 font-display text-lg font-semibold tracking-tight">{children}</dd>
      </div>
    </div>
  );
}

export function MapEmbed({ query, title }: { query: string; title: string }) {
  // Keyless Google Maps embed, loaded lazily and isolated in a sandboxed frame.
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className="h-full w-full border-0 grayscale-[30%]"
    />
  );
}

export default function Contact() {
  const c = useLoaderData() as ContentMap['contact'];
  const { settings } = useSite();
  const mapQuery = settings.mapQuery || settings.address;
  const icon = 'h-5 w-5';

  return (
    <>
      <Seo title="Contact Us" seo={c.seo} description={c.intro} />
      <PageHero eyebrow="Contact Us" title={c.heading} intro={c.intro} crumbs={[{ label: 'Contact Us' }]} />

      <section aria-label="Contact details and inquiry form" className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight">Reach the team</h2>
              {settings.address || settings.email || settings.phone ? (
                <dl className="mt-6">
                  {settings.address && (
                    <Detail icon={<MapPin className={icon} />} label="Address">
                      <span className="whitespace-pre-line">{settings.address}</span>
                    </Detail>
                  )}
                  {settings.phone && (
                    <Detail icon={<Phone className={icon} />} label="Phone">
                      <a href={telHref(settings.phone)} className="hover:text-blue">
                        {settings.phone}
                      </a>
                    </Detail>
                  )}
                  {settings.whatsapp && (
                    <Detail icon={<MessageCircle className={icon} />} label="WhatsApp">
                      <a href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue">
                        {settings.whatsapp}
                      </a>
                    </Detail>
                  )}
                  {settings.email && (
                    <Detail icon={<Mail className={icon} />} label="Business email">
                      <a href={`mailto:${settings.email}`} className="break-all hover:text-blue">
                        {settings.email}
                      </a>
                    </Detail>
                  )}
                  {settings.businessHours && (
                    <Detail icon={<Clock className={icon} />} label="Business hours">
                      {settings.businessHours}
                    </Detail>
                  )}
                </dl>
              ) : (
                <Pending label="Company address, business email and phone number" className="mt-6" />
              )}
              {c.businessCta && <p className="mt-8 border-l-2 border-cyan pl-5 leading-relaxed text-muted">{c.businessCta}</p>}
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <InquiryForm heading={c.formHeading || 'Send an inquiry'} />
          </Reveal>
        </div>
      </section>

      <section aria-label="Location map" className="bg-paper">
        <div className="aspect-[16/9] max-h-[520px] w-full sm:aspect-[21/9]">
          {mapQuery ? (
            <MapEmbed query={mapQuery} title={`Map showing ${settings.companyName}`} />
          ) : (
            <div className="shell grid h-full place-items-center">
              <Pending label="Location for the Google Map (add the address in Settings)" />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
