import { createBrowserRouter, data, type LoaderFunctionArgs } from 'react-router';
import { adminRoutes } from './admin/routes';
import SiteLayout, { BootScreen } from './components/layout/SiteLayout';
import { api, ApiError } from './lib/api';
import { RouteError } from './pages/NotFound';

/** Short-lived cache so back/forward navigation is instant without serving stale content for long. */
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 60_000;

// The server embeds the first page's API data in the HTML (inert JSON); seed the cache with it.
try {
  const embedded = document.getElementById('__ARIZEN_DATA__')?.textContent;
  if (embedded) for (const [url, value] of Object.entries(JSON.parse(embedded))) cache.set(url, { at: Date.now(), value });
} catch {
  // Malformed or missing data simply means the first page fetches as usual.
}

async function cached<T>(url: string, signal: AbortSignal): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  try {
    const value = await api.get<T>(url, signal);
    cache.set(url, { at: Date.now(), value });
    return value;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw data('Not found', { status: 404 });
    throw err;
  }
}

const content =
  (key: string) =>
  ({ request }: LoaderFunctionArgs) =>
    cached(`/api/content/${key}`, request.signal);

const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    loader: ({ request }) => cached('/api/site', request.signal),
    shouldRevalidate: () => false,
    Component: SiteLayout,
    HydrateFallback: BootScreen,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, loader: content('home'), lazy: page(() => import('./pages/Home')) },
          { path: 'about', loader: content('about'), lazy: page(() => import('./pages/About')) },
          { path: 'products', loader: content('products'), lazy: page(() => import('./pages/Products')) },
          {
            path: 'products/:slug',
            loader: ({ params, request }) => cached(`/api/products/${encodeURIComponent(params.slug ?? '')}`, request.signal),
            lazy: page(() => import('./pages/ProductDetail')),
          },
          { path: 'infrastructure', loader: content('infrastructure'), lazy: page(() => import('./pages/Infrastructure')) },
          { path: 'quality', loader: content('quality'), lazy: page(() => import('./pages/Quality')) },
          { path: 'contact', loader: content('contact'), lazy: page(() => import('./pages/Contact')) },
          { path: 'request-quote', lazy: page(() => import('./pages/RequestQuote')) },
          { path: '*', lazy: page(() => import('./pages/NotFound')) },
        ],
      },
    ],
  },
  adminRoutes,
]);
