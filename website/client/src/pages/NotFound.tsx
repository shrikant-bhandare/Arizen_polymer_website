import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ButtonLink } from '../components/ui/Button';
import { PageHero } from '../components/ui/PageHero';
import { Seo } from '../components/ui/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <PageHero eyebrow="Error 404" title="This page could not be found." intro="The page may have moved, or the address may be mistyped.">
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/products" variant="onDark">
            Browse products
          </ButtonLink>
        </div>
      </PageHero>
    </>
  );
}

/** Route-level error boundary: 404s render the not-found page; anything else a calm retry message. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <>
      <Seo title="Something went wrong" noindex />
      <PageHero eyebrow="Temporarily unavailable" title="We couldn’t load this page." intro="Please check your connection and try again in a moment.">
        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-12 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-navy hover:bg-white">
            Try again
          </button>
          <ButtonLink href="/" variant="onDark">
            Back to home
          </ButtonLink>
        </div>
      </PageHero>
    </>
  );
}
