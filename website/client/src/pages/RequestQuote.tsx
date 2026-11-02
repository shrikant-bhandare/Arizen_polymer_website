import { Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { InquiryForm } from '../components/InquiryForm';
import { Reveal } from '../components/motion/Reveal';
import { Img } from '../components/ui/Img';
import { PageHero } from '../components/ui/PageHero';
import { Seo } from '../components/ui/Seo';
import { useSite } from '../lib/site';

const steps = ['Tell us the product, grade and quantity', 'The Arizen team reviews your requirement', 'You receive a quotation and next steps'];

export default function RequestQuote() {
  const { products } = useSite();
  const [params] = useSearchParams();
  const slug = params.get('product') ?? '';
  const product = products.find((p) => p.slug === slug);

  return (
    <>
      <Seo title="Request a Quote" description="Request a quotation for HIPS, ABS, HDPE or polystyrene granules from Arizen Polymers India Private Limited." />
      <PageHero
        eyebrow="Request a Quote"
        title={product ? `Request a quote for ${product.code}.` : 'Request a quote.'}
        intro="Share your requirement and the Arizen team will prepare a quotation."
        crumbs={[{ label: 'Products', href: '/products' }, { label: 'Request a Quote' }]}
      />
      <section aria-label="Quotation request" className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            {product && (
              <Reveal>
                <Link to={`/products/${product.slug}`} className="group block border border-navy/10">
                  <div className="aspect-[4/3] overflow-hidden bg-paper">
                    <Img src={product.image.url} alt={product.image.alt || product.name} sizes="(min-width: 1024px) 30vw, 100vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="font-display text-4xl font-extrabold tracking-tight">{product.code}</p>
                    <p className="mt-1 font-semibold text-blue">{product.name}</p>
                    {product.summary && <p className="mt-3 text-sm leading-relaxed text-muted">{product.summary}</p>}
                  </div>
                </Link>
              </Reveal>
            )}
            <Reveal delay={0.1} className={product ? 'mt-10' : ''}>
              <h2 className="eyebrow text-muted">How it works</h2>
              <ol className="mt-5 space-y-4">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper font-display text-xs font-bold text-blue">{i + 1}</span>
                    <span className="pt-0.5 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Include your expected volume and delivery location for an accurate quotation.
              </p>
            </Reveal>
          </aside>
          <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
            <InquiryForm key={slug} defaultProduct={slug} heading="Your requirement" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
