import { Copy, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Img } from '../../components/ui/Img';
import { api, ApiError } from '../../lib/api';
import type { MediaAsset, Paged } from '../../lib/types';
import { useAdmin } from '../auth';
import { DropZone, useUpload } from '../media';
import { Button, ConfirmDialog, EmptyState, ErrorNote, formatDate, PageHeader, Pagination, Spinner, TextArea, TextInput, useResource, useToast } from '../ui';

export default function MediaPage() {
  const user = useAdmin();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const { data, setData, error, loading, reload } = useResource<Paged<MediaAsset>>(`/api/admin/media?page=${page}&q=${encodeURIComponent(query)}`);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [usage, setUsage] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setAlt(selected?.alt ?? '');
    setCaption(selected?.caption ?? '');
    setUsage(null);
    if (selected) api.get<{ usage: string[] }>(`/api/admin/media/${selected._id}/usage`).then((r) => setUsage(r.usage)).catch(() => setUsage([]));
  }, [selected]);

  const { upload, busy } = useUpload(
    useCallback(
      (asset: MediaAsset) => {
        setData((d) => (d ? { ...d, items: [asset, ...d.items], total: d.total + 1 } : d));
        setSelected(asset);
      },
      [setData],
    ),
  );

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.patch<MediaAsset>(`/api/admin/media/${selected._id}`, { alt, caption });
      setData((d) => (d ? { ...d, items: d.items.map((m) => (m._id === updated._id ? updated : m)) } : d));
      setSelected(updated);
      toast('success', 'Image details saved.');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await api.delete(`/api/admin/media/${selected._id}?force=true`);
      setData((d) => (d ? { ...d, items: d.items.filter((m) => m._id !== selected._id), total: d.total - 1 } : d));
      setSelected(null);
      toast('success', 'Image deleted.');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(new URL(selected.url, window.location.origin).href);
    toast('success', 'Image URL copied.');
  };

  return (
    <>
      <PageHeader title="Media library" description="Upload once, use anywhere. Images are resized and converted to WebP and AVIF automatically, and location data is removed." />
      <DropZone onFiles={upload} busy={busy} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <label className="relative block">
            <span className="sr-only">Search images</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or alt text" className="w-full rounded-lg border border-navy/15 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-blue" />
          </label>
          {error ? (
            <div className="mt-4">
              <ErrorNote error={error} onRetry={reload} />
            </div>
          ) : loading && !data ? (
            <Spinner />
          ) : !data?.items.length ? (
            <div className="mt-4">
              <EmptyState title={query ? 'No images match your search' : 'No images yet'}>Upload product photographs, facility images or certificates above.</EmptyState>
            </div>
          ) : (
            <>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {data.items.map((m) => (
                  <li key={m._id}>
                    <button type="button" onClick={() => setSelected(m)} aria-pressed={selected?._id === m._id} className={`block w-full overflow-hidden rounded-lg border-2 bg-white text-left transition-colors ${selected?._id === m._id ? 'border-blue' : 'border-transparent hover:border-navy/20'}`}>
                      <span className="block aspect-[4/3] bg-paper">
                        <Img src={m.url} alt="" sizes="240px" className="h-full w-full object-cover" />
                      </span>
                      <span className="block truncate px-2 py-1.5 text-xs">{m.alt || <span className="text-warning">Missing alt text</span>}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination page={data.page} pages={data.pages} onPage={setPage} />
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {selected ? (
            <div className="rounded-xl border border-navy/10 bg-white p-5">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                <Img src={selected.url} alt="" sizes="320px" className="h-full w-full object-contain" />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
                <dt>Size</dt>
                <dd className="text-right text-navy">
                  {selected.width} × {selected.height}
                </dd>
                <dt>File</dt>
                <dd className="text-right text-navy">{Math.round(selected.size / 1024)} KB WebP</dd>
                <dt>Uploaded</dt>
                <dd className="text-right text-navy">{formatDate(selected.createdAt)}</dd>
              </dl>
              <div className="mt-5 space-y-4">
                <TextInput label="Alt text" value={alt} max={200} onChange={(e) => setAlt(e.target.value)} help="Describe what the image shows." />
                <TextArea label="Caption" value={caption} max={300} rows={2} onChange={(e) => setCaption(e.target.value)} />
              </div>
              <p className="mt-4 text-xs text-muted">{usage === null ? 'Checking where this image is used…' : usage.length ? `Used in: ${usage.join(', ')}` : 'Not used on the website yet.'}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={save} busy={saving}>
                  Save
                </Button>
                <Button tone="secondary" onClick={copyUrl}>
                  <Copy className="h-4 w-4" aria-hidden="true" /> Copy URL
                </Button>
                {user.role === 'admin' && (
                  <Button tone="danger" onClick={() => setDeleting(true)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Delete image</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-navy/15 p-6 text-sm text-muted">Select an image to edit its alt text, see where it is used, or delete it.</p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={deleting}
        title="Delete this image?"
        body={usage?.length ? <>This image is still used in: <strong>{usage.join(', ')}</strong>. Those places will show no image until you choose another.</> : 'The image and all its sizes will be permanently deleted.'}
        onCancel={() => setDeleting(false)}
        onConfirm={remove}
      />
    </>
  );
}
