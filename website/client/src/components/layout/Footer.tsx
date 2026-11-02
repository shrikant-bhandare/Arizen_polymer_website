import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { telHref, useSite } from '../../lib/site';
import { ButtonLink } from '../ui/Button';
import { Pending } from '../ui/Pending';
import { Logo } from './Logo';

export function Footer() {
  const { footer, navigation, products, settings } = useSite();
  const company = navigation.items.filter((i) => i.visible && !['/', '/products', '/contact'].includes(i.href));
  const hasContact = settings.address || settings.email || settings.phone;
  // Home, Contact and Request a Quote already end with an inquiry call to action.
  const showCta = !['/', '/contact', '/request-quote'].includes(useLocation().pathname);

  return (
    <footer className="bg-navy text-white">
      <div className="shell">
        {showCta && (
          <div className="flex flex-col gap-8 border-b border-white/10 py-16 md:flex-row md:items-end md:justify-between">
            <p className="display max-w-2xl text-[clamp(2rem,4.4vw,3.75rem)]">{footer.ctaHeading || 'Have a requirement in mind?'}</p>
            <ButtonLink href="/request-quote">{navigation.ctaLabel || 'Request a Quote'}</ButtonLink>
          </div>
        )}

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            {footer.tagline && <p className="mt-6 max-w-sm text-sm leading-relaxed text-silver/65">{footer.tagline}</p>}
            {settings.social.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-4 text-sm">
                {settings.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-silver/70 hover:text-cyan">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Products" className="lg:col-span-2">
            <p className="eyebrow text-silver/65">Products</p>
            <ul className="mt-5 space-y-3 text-sm">
              {products.map((p) => (
                <li key={p._id}>
                  <Link to={`/products/${p.slug}`} className="text-silver/80 hover:text-cyan">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <p className="eyebrow text-silver/65">Company</p>
            <ul className="mt-5 space-y-3 text-sm">
              {company.map((i) => (
                <li key={i.href}>
                  <Link to={i.href} className="text-silver/80 hover:text-cyan">
                    {i.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contact" className="text-silver/80 hover:text-cyan">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="eyebrow text-silver/65">Contact</p>
            {hasContact ? (
              <ul className="mt-5 space-y-4 text-sm text-silver/80">
                {settings.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    <span className="whitespace-pre-line">{settings.address}</span>
                  </li>
                )}
                {settings.phone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    <a href={telHref(settings.phone)} className="hover:text-cyan">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    <a href={`mailto:${settings.email}`} className="hover:text-cyan">
                      {settings.email}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <Pending tone="dark" label="Business address, email and phone number" className="mt-5" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-silver/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {footer.legal || settings.companyName}
          </p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 self-start hover:text-cyan sm:self-auto">
            Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
