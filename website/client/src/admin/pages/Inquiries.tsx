import { Download, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { inquiryStatuses, inquiryStatusLabels } from '@shared/schemas';
import type { Inquiry, Paged, ProductCard } from '../../lib/types';
import { StatusPill } from '../StatusPill';
import { EmptyState, ErrorNote, formatDate, PageHeader, Pagination, Spinner, useResource } from '../ui';

const control = 'rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/15';

export default function Inquiries() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const products = useResource<ProductCard[]>('/api/admin/products');

  // Debounce the free-text search into the URL so filters are shareable and survive reloads.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if ((params.get('q') ?? '') === q) return;
      const next = new URLSearchParams(params);
      if (q) next.set('q', q);
      else next.delete('q');
      next.delete('page');
      setParams(next, { replace: true });
    }, 300);
    return () => window.clearTimeout(t);
  }, [q, params, setParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const query = params.toString();
  const { data, error, loading, reload } = useResource<Paged<Inquiry>>(`/api/admin/inquiries?${query}`);
  const exportParams = new URLSearchParams(params);
  exportParams.delete('page');

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Every quote request and message sent from the website."
        actions={
          <a href={`/api/admin/inquiries/export.csv?${exportParams}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 text-sm font-semibold hover:border-navy/40" download>
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </a>
        }
      />

      <div className="mb-5 grid gap-3 rounded-xl border border-navy/10 bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search inquiries</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email or phone" className={`${control} w-full pl-9`} />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select value={params.get('status') ?? ''} onChange={(e) => setFilter('status', e.target.value)} className={`${control} w-full`}>
            <option value="">All statuses</option>
            {inquiryStatuses.map((s) => (
              <option key={s} value={s}>
                {inquiryStatusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Product</span>
          <select value={params.get('product') ?? ''} onChange={(e) => setFilter('product', e.target.value)} className={`${control} w-full`}>
            <option value="">All products</option>
            <option value="general">General inquiries</option>
            {products.data?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          From
          <input type="date" value={params.get('from') ?? ''} onChange={(e) => setFilter('from', e.target.value)} className={control} />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          To
          <input type="date" value={params.get('to') ?? ''} onChange={(e) => setFilter('to', e.target.value)} className={control} />
        </label>
      </div>

      {error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : !data?.items.length ? (
        <EmptyState title={query ? 'No inquiries match these filters' : 'No inquiries yet'}>{query ? 'Try clearing a filter.' : 'Inquiries submitted on the website appear here.'}</EmptyState>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            {data.total} {data.total === 1 ? 'inquiry' : 'inquiries'}
          </p>
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-navy/10 bg-paper text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Received</th>
                  <th scope="col" className="px-4 py-3 font-medium">Company / contact</th>
                  <th scope="col" className="px-4 py-3 font-medium">Product</th>
                  <th scope="col" className="px-4 py-3 font-medium">Quantity</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {data.items.map((i) => (
                  <tr key={i._id} className={`hover:bg-paper ${i.status === 'new' ? 'font-medium' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(i.createdAt, true)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/inquiries/${i._id}`} className="font-semibold text-navy hover:text-blue">
                        {i.companyName}
                      </Link>
                      <span className="block text-xs text-muted">
                        {i.fullName} · {i.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">{i.productName || <span className="text-muted">General</span>}</td>
                    <td className="px-4 py-3 text-muted">{i.quantity || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onPage={(p) => setFilter('page', String(p))} />
        </>
      )}
    </>
  );
}
