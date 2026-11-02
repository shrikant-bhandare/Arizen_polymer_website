import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { SeoFields } from '@shared/content';
import { ImageField } from './media';
import { Button, TextArea, TextInput } from './ui';

/** Moves an item within an array (returns a new array). */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function RowControls({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 hover:text-navy disabled:opacity-30">
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Move {label} up</span>
      </button>
      <button type="button" onClick={() => onMove(index + 1)} disabled={index === count - 1} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 hover:text-navy disabled:opacity-30">
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Move {label} down</span>
      </button>
      <button type="button" onClick={onRemove} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Remove {label}</span>
      </button>
    </div>
  );
}

/** A list of paragraphs, each its own text area. */
export function ParagraphsEditor({ label, value, onChange, error, help }: { label: string; value: string[]; onChange: (v: string[]) => void; error?: string; help?: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {help && <p className="mb-2 text-xs text-muted">{help}</p>}
      <div className="space-y-2">
        {value.map((p, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              aria-label={`${label}, paragraph ${i + 1}`}
              value={p}
              rows={3}
              maxLength={3000}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              className="w-full rounded-lg border border-navy/15 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
            />
            <RowControls index={i} count={value.length} label="paragraph" onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <Button tone="secondary" className="mt-2" onClick={() => onChange([...value, ''])}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add paragraph
      </Button>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </fieldset>
  );
}

/** Short text items entered one at a time and shown as removable chips. */
export function StringsEditor({ label, value, onChange, placeholder, help }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; help?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {help && <p className="mb-2 text-xs text-muted">{help}</p>}
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((v, i) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full bg-paper py-1 pr-1 pl-3 text-sm ring-1 ring-navy/10">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Remove {v}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          aria-label={`Add to ${label}`}
          value={draft}
          maxLength={200}
          placeholder={placeholder ?? 'Type and press Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue"
        />
        <Button tone="secondary" onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
    </fieldset>
  );
}

/** SEO fields with character counters and a live search-result preview. */
export function SeoEditor({ value, onChange, errors, fallbackTitle, fallbackDescription, path }: { value: SeoFields; onChange: (v: SeoFields) => void; errors: Record<string, string>; fallbackTitle: string; fallbackDescription: string; path: string }) {
  const set = (k: keyof SeoFields, v: string) => onChange({ ...value, [k]: v });
  const title = value.title || fallbackTitle;
  const description = value.description || fallbackDescription;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-navy/10 bg-paper p-4" aria-label="Search result preview">
        <p className="text-xs text-muted">Search result preview</p>
        <p className="mt-2 truncate text-xs text-[#4d5156]">{window.location.host}{path}</p>
        <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">{description || 'Add a meta description so search engines show a useful summary.'}</p>
      </div>
      <TextInput label="Meta title" value={value.title} max={70} placeholder={fallbackTitle} onChange={(e) => set('title', e.target.value)} error={errors['seo.title']} help="Leave blank to use the default shown above. Aim for 50–60 characters." />
      <TextArea label="Meta description" value={value.description} max={170} rows={3} placeholder={fallbackDescription} onChange={(e) => set('description', e.target.value)} error={errors['seo.description']} help="Aim for 120–160 characters." />
      <ImageField label="Open Graph image (shown when the page is shared)" value={{ url: value.ogImage, alt: '' }} onChange={(img) => set('ogImage', img.url)} error={errors['seo.ogImage']} help="1200 × 630 px works best. Defaults to the main image." />
      <TextInput label="Canonical URL" value={value.canonical} placeholder="https://… (leave blank for the page’s own address)" onChange={(e) => set('canonical', e.target.value)} error={errors['seo.canonical']} help="Only needed if this content also lives at another address." />
    </div>
  );
}

export function Section({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
