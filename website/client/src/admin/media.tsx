import { ImagePlus, Loader2, Search, UploadCloud, X } from 'lucide-react';
import { useCallback, useId, useRef, useState, type DragEvent } from 'react';
import type { Img as ImgRef } from '@shared/content';
import { Img } from '../components/ui/Img';
import { api, ApiError } from '../lib/api';
import type { MediaAsset, Paged } from '../lib/types';
import { Button, Modal, useResource, useToast } from './ui';

export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const MAX_MB = 10;

/** Client-side checks mirror the server so editors get instant, specific feedback. */
export function checkFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return `${file.name}: only JPEG, PNG, WebP and AVIF images can be uploaded.`;
  if (file.size > MAX_MB * 1024 * 1024) return `${file.name}: images must be ${MAX_MB} MB or smaller.`;
  return null;
}

export function useUpload(onDone: (asset: MediaAsset) => void) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const upload = useCallback(
    async (files: FileList | File[]) => {
      setBusy(true);
      for (const file of Array.from(files)) {
        const problem = checkFile(file);
        if (problem) {
          toast('error', problem);
          continue;
        }
        const form = new FormData();
        form.append('file', file);
        try {
          onDone(await api.post<MediaAsset>('/api/admin/media', form));
          toast('success', `${file.name} uploaded.`);
        } catch (err) {
          toast('error', err instanceof ApiError ? `${file.name}: ${err.message}` : `${file.name} could not be uploaded.`);
        }
      }
      setBusy(false);
    },
    [onDone, toast],
  );
  return { upload, busy };
}

export function DropZone({ onFiles, busy, compact }: { onFiles: (f: FileList) => void; busy: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors ${over ? 'border-blue bg-blue/5' : 'border-navy/15 bg-white'} ${compact ? 'px-4 py-6' : 'px-6 py-10'}`}
    >
      {busy ? <Loader2 className="h-6 w-6 animate-spin text-blue" aria-hidden="true" /> : <UploadCloud className="h-6 w-6 text-blue" strokeWidth={1.5} aria-hidden="true" />}
      <p className="text-sm">
        Drag images here, or{' '}
        <button type="button" onClick={() => input.current?.click()} className="font-semibold text-blue underline-offset-2 hover:underline" disabled={busy}>
          browse
        </button>
      </p>
      <p className="text-xs text-muted">JPEG, PNG, WebP or AVIF · up to {MAX_MB} MB · converted to WebP and AVIF automatically</p>
      <input ref={input} type="file" accept={ACCEPTED.join(',')} multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
    </div>
  );
}

/** Modal library browser used by every image field in the dashboard. */
export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (img: ImgRef) => void }) {
  const [q, setQ] = useState('');
  const { data, setData } = useResource<Paged<MediaAsset>>(open ? `/api/admin/media?limit=60&q=${encodeURIComponent(q)}` : null);
  const { upload, busy } = useUpload(useCallback((asset: MediaAsset) => setData((d) => (d ? { ...d, items: [asset, ...d.items], total: d.total + 1 } : d)), [setData]));

  return (
    <Modal open={open} onClose={onClose} title="Choose an image" wide>
      <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
        <div>
          <label className="relative block">
            <span className="sr-only">Search images</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or alt text" className="w-full rounded-lg border border-navy/15 py-2 pr-3 pl-9 text-sm outline-none focus:border-blue" />
          </label>
          <ul className="mt-4 grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {data?.items.map((m) => (
              <li key={m._id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick({ url: m.url, alt: m.alt });
                    onClose();
                  }}
                  className="group block w-full overflow-hidden rounded-lg border border-navy/10 text-left hover:border-blue focus-visible:border-blue"
                >
                  <span className="block aspect-[4/3] bg-paper">
                    <Img src={m.url} alt="" sizes="200px" className="h-full w-full object-cover" />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs text-muted group-hover:text-navy">{m.alt || m.originalName}</span>
                </button>
              </li>
            ))}
          </ul>
          {data && data.items.length === 0 && <p className="mt-6 text-sm text-muted">No images yet. Upload one to get started.</p>}
        </div>
        <DropZone onFiles={upload} busy={busy} compact />
      </div>
    </Modal>
  );
}

/** Image field: preview, choose from library, set alt text, or clear. */
export function ImageField({ label, value, onChange, error, help }: { label: string; value: ImgRef; onChange: (v: ImgRef) => void; error?: string; help?: string }) {
  const [open, setOpen] = useState(false);
  const altId = useId();
  return (
    <div className="@container">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className={`flex flex-col gap-4 rounded-xl border p-3 @md:flex-row ${error ? 'border-danger' : 'border-navy/15'}`}>
        <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-paper @md:w-40">
          {value.url ? <Img src={value.url} alt="" sizes="160px" className="h-full w-full object-contain" /> : <ImagePlus className="h-6 w-6 text-mist" aria-hidden="true" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted" htmlFor={altId}>
              Alt text (describes the image for screen readers and search engines)
            </label>
            <input id={altId} value={value.alt} maxLength={200} onChange={(e) => onChange({ ...value, alt: e.target.value })} className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue" disabled={!value.url} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button tone="secondary" onClick={() => setOpen(true)}>
              {value.url ? 'Replace' : 'Choose image'}
            </Button>
            {value.url && (
              <Button tone="ghost" onClick={() => onChange({ url: '', alt: '' })}>
                <X className="h-4 w-4" aria-hidden="true" /> Remove
              </Button>
            )}
          </div>
          {value.url && <p className="truncate text-xs text-mist">{value.url}</p>}
        </div>
      </div>
      {help && !error && <p className="mt-1.5 text-xs text-muted">{help}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(img) => onChange({ url: img.url, alt: value.alt || img.alt })} />
    </div>
  );
}
