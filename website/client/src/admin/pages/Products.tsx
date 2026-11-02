import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Img } from '../../components/ui/Img';
import { api, ApiError } from '../../lib/api';
import { useAdmin } from '../auth';
import { ConfirmDialog, EmptyState, ErrorNote, formatDate, PageHeader, Spinner, Switch, useResource, useToast } from '../ui';

interface Row {
  _id: string;
  name: string;
  code: string;
  slug: string;
  status: 'draft' | 'published';
  image: { url: string };
  category: { name: string } | null;
  updatedAt: string;
}

export default function ProductsPage() {
  const user = useAdmin();
  const toast = useToast();
  const { data, setData, error, loading, reload } = useResource<Row[]>('/api/admin/products');
  const [pending, setPending] = useState<Row | null>(null);

  const toggle = async (row: Row) => {
    const status = row.status === 'published' ? 'draft' : 'published';
    setData((d) => d?.map((p) => (p._id === row._id ? { ...p, status } : p)) ?? d);
    try {
      await api.patch(`/api/admin/products/${row._id}/status`, { status });
      toast('success', `${row.name} ${status === 'published' ? 'published' : 'moved to draft'}.`);
    } catch (err) {
      setData((d) => d?.map((p) => (p._id === row._id ? row : p)) ?? d);
      toast('error', err instanceof ApiError ? err.message : 'Could not update.');
    }
  };

  const remove = async () => {
    if (!pending) return;
    try {
      await api.delete(`/api/admin/products/${pending._id}`);
      setData((d) => d?.filter((p) => p._id !== pending._id) ?? d);
      toast('success', `${pending.name} deleted.`);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete.');
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="The product catalogue shown on the website. Drafts are visible only here."
        actions={
          <Link to="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-blue">
            <Plus className="h-4 w-4" aria-hidden="true" /> New product
          </Link>
        }
      />
      {error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title="No products yet">Create the first product to start the catalogue.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-navy/10 bg-paper text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Product</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Published</th>
                <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data.map((p) => (
                <tr key={p._id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${p._id}`} className="flex items-center gap-3">
                      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper">{p.image?.url && <Img src={p.image.url} alt="" sizes="64px" className="h-full w-full object-cover" />}</span>
                      <span>
                        <span className="block font-semibold text-navy hover:text-blue">{p.name}</span>
                        <span className="block text-xs text-muted">
                          {p.code} · /products/{p.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Switch checked={p.status === 'published'} onChange={() => toggle(p)} label={p.status === 'published' ? 'Live' : 'Draft'} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {p.status === 'published' && (
                        <a href={`/products/${p.slug}`} target="_blank" rel="noopener" className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 hover:text-navy">
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">View {p.name} on the website</span>
                        </a>
                      )}
                      {user.role === 'admin' && (
                        <button type="button" onClick={() => setPending(p)} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete {p.name}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!pending} title={`Delete ${pending?.name ?? 'product'}?`} body="The product page will be removed from the website. Past inquiries keep the product name. This cannot be undone." onCancel={() => setPending(null)} onConfirm={remove} />
    </>
  );
}
