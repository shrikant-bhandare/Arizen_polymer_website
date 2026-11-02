import { ArrowLeft, ExternalLink, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { z } from 'zod';
import { productInput } from '@shared/schemas';
import { Img } from '../../components/ui/Img';
import { api, ApiError } from '../../lib/api';
import type { Category, Product } from '../../lib/types';
import { move, ParagraphsEditor, RowControls, Section, SeoEditor, StringsEditor } from '../editors';
import { ImageField, MediaPicker } from '../media';
import { Button, ErrorNote, PageHeader, SelectInput, Spinner, Switch, TextArea, TextInput, useDraft, useResource, useToast, useUnsavedWarning } from '../ui';

type Draft = Omit<z.output<typeof productInput>, 'category'> & { category: string };

const blank: Draft = {
  name: '',
  code: '',
  slug: '',
  category: '',
  tagline: '',
  summary: '',
  description: [],
  image: { url: '', alt: '' },
  gallery: [],
  specifications: [],
  specificationsNote: '',
  grades: [],
  applications: [],
  relatedProducts: [],
  status: 'draft',
  order: 0,
  seo: { title: '', description: '', ogImage: '', canonical: '' },
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function toDraft(p: Product & { category: unknown; relatedProducts?: string[] }): Draft {
  const pick = Object.keys(blank) as (keyof Draft)[];
  const d = Object.fromEntries(pick.map((k) => [k, (p as unknown as Record<string, unknown>)[k] ?? blank[k]])) as Draft;
  d.category = typeof p.category === 'string' ? p.category : ((p.category as { _id?: string } | null)?._id ?? '');
  d.relatedProducts = (p.relatedProducts ?? []).map(String);
  return d;
}

export default function ProductEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const product = useResource<Product & { relatedProducts: string[] }>(isNew ? null : `/api/admin/products/${id}`);
  const categories = useResource<Category[]>('/api/admin/categories');
  const all = useResource<{ _id: string; name: string; code: string }[]>('/api/admin/products');
  const initial = useMemo(() => (isNew ? blank : product.data ? toDraft(product.data) : null), [isNew, product.data]);
  const { draft, set, errors, setErrors, failWith, dirty, setDirty } = useDraft<Draft>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [galleryPicker, setGalleryPicker] = useState(false);
  useUnsavedWarning(dirty);

  useEffect(() => {
    if (isNew && !slugTouched && draft) set(['slug'], slugify(draft.name));
  }, [draft?.name]);

  if (!isNew && product.error) return <ErrorNote error={product.error} onRetry={product.reload} />;
  if (!draft) return <Spinner />;

  const save = async () => {
    const payload = { ...draft, category: draft.category || null };
    const check = productInput.safeParse(payload);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      toast('error', 'Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await api.post<{ _id: string }>('/api/admin/products', payload);
        setDirty(false);
        toast('success', 'Product created.');
        navigate(`/admin/products/${created._id}`, { replace: true });
      } else {
        await api.put(`/api/admin/products/${id}`, payload);
        setDirty(false);
        toast('success', 'Product saved.');
      }
    } catch (err) {
      failWith(err);
      toast('error', err instanceof ApiError ? err.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  const e = errors;

  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/products" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All products
          </Link>
        }
        title={isNew ? 'New product' : draft.name || 'Edit product'}
        description={dirty ? 'Unsaved changes' : isNew ? 'Fill in the details, then save.' : 'All changes saved.'}
        actions={
          <>
            {!isNew && draft.status === 'published' && (
              <a href={`/products/${draft.slug}`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 text-sm font-semibold hover:border-navy/40">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> View
              </a>
            )}
            <Button onClick={save} busy={saving}>
              {isNew ? 'Create product' : 'Save changes'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Basics">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Product name" value={draft.name} max={120} onChange={(ev) => set(['name'], ev.target.value)} error={e.name} />
              <TextInput label="Code" value={draft.code} max={20} onChange={(ev) => set(['code'], ev.target.value)} error={e.code} help="Short name shown large, e.g. HIPS." />
              <TextInput
                label="URL slug"
                value={draft.slug}
                max={80}
                onChange={(ev) => {
                  setSlugTouched(true);
                  set(['slug'], ev.target.value.toLowerCase());
                }}
                error={e.slug}
                help={`Page address: /products/${draft.slug || '…'}`}
              />
              <SelectInput label="Category" value={draft.category} onChange={(ev) => set(['category'], ev.target.value)} error={e.category}>
                <option value="">No category</option>
                {categories.data?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            <TextInput label="Tagline" value={draft.tagline} max={160} onChange={(ev) => set(['tagline'], ev.target.value)} error={e.tagline} help="One line under the product name." />
            <TextArea label="Summary" value={draft.summary} max={400} rows={3} onChange={(ev) => set(['summary'], ev.target.value)} error={e.summary} help="Shown on product cards and as the default search description." />
            <ParagraphsEditor label="Description" value={draft.description} onChange={(v) => set(['description'], v)} error={e.description} />
          </Section>

          <Section title="Technical specifications" description="Only enter values confirmed by Arizen. Leave empty to show the note below instead.">
            {draft.specifications.length > 0 && (
              <div className="space-y-2">
                <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_1fr_auto] gap-2 text-xs text-muted sm:grid">
                  <span>Property</span>
                  <span>Value</span>
                  <span>Unit</span>
                  <span>Test method</span>
                  <span className="w-[6.5rem]" />
                </div>
                {draft.specifications.map((s, i) => (
                  <div key={i} className="grid gap-2 rounded-lg border border-navy/10 p-2 sm:grid-cols-[1.4fr_1fr_0.7fr_1fr_auto] sm:border-0 sm:p-0">
                    {(['property', 'value', 'unit', 'testMethod'] as const).map((k) => (
                      <input
                        key={k}
                        aria-label={`Row ${i + 1} ${k}`}
                        placeholder={{ property: 'e.g. Melt flow index', value: 'e.g. 8', unit: 'e.g. g/10 min', testMethod: 'e.g. ASTM D1238' }[k]}
                        value={s[k]}
                        onChange={(ev) => set(['specifications', i, k], ev.target.value)}
                        aria-invalid={e[`specifications.${i}.${k}`] ? true : undefined}
                        className="min-w-0 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue aria-[invalid=true]:border-danger"
                      />
                    ))}
                    <RowControls index={i} count={draft.specifications.length} label="row" onMove={(to) => set(['specifications'], move(draft.specifications, i, to))} onRemove={() => set(['specifications'], draft.specifications.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
            )}
            <Button tone="secondary" onClick={() => set(['specifications'], [...draft.specifications, { property: '', value: '', unit: '', testMethod: '' }])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add specification
            </Button>
            <TextArea label="Specifications note" value={draft.specificationsNote} max={400} rows={2} onChange={(ev) => set(['specificationsNote'], ev.target.value)} help="Shown with the table, or instead of it when there are no rows." />
          </Section>

          <Section title="Available grades">
            {draft.grades.map((g, i) => (
              <div key={i} className="flex gap-2">
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
                  <input aria-label={`Grade ${i + 1} name`} placeholder="Grade name" value={g.name} onChange={(ev) => set(['grades', i, 'name'], ev.target.value)} className="min-w-0 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue" />
                  <input aria-label={`Grade ${i + 1} description`} placeholder="Short description" value={g.description} onChange={(ev) => set(['grades', i, 'description'], ev.target.value)} className="min-w-0 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue" />
                </div>
                <RowControls index={i} count={draft.grades.length} label="grade" onMove={(to) => set(['grades'], move(draft.grades, i, to))} onRemove={() => set(['grades'], draft.grades.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button tone="secondary" onClick={() => set(['grades'], [...draft.grades, { name: '', description: '' }])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add grade
            </Button>
          </Section>

          <Section title="Applications">
            <StringsEditor label="Typical applications" value={draft.applications} onChange={(v) => set(['applications'], v)} placeholder="e.g. Appliance liners" />
          </Section>

          <Section title="Search engines & sharing">
            <SeoEditor value={draft.seo} onChange={(v) => set(['seo'], v)} errors={e} path={`/products/${draft.slug}`} fallbackTitle={`${draft.name || 'Product'} (${draft.code || 'CODE'}) | Arizen Polymers`} fallbackDescription={draft.summary} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility">
            <Switch checked={draft.status === 'published'} onChange={(v) => set(['status'], v ? 'published' : 'draft')} label={draft.status === 'published' ? 'Published' : 'Draft'} help="Drafts are not shown on the website." />
            <TextInput label="Display order" type="number" min={0} max={999} value={String(draft.order)} onChange={(ev) => set(['order'], Number(ev.target.value) || 0)} help="Lower numbers appear first." />
          </Section>
          <Section title="Images">
            <ImageField label="Main image" value={draft.image} onChange={(v) => set(['image'], v)} error={e['image.url']} />
            <div>
              <p className="mb-1.5 text-sm font-medium">Gallery</p>
              <ul className="grid grid-cols-3 gap-2">
                {draft.gallery.map((g, i) => (
                  <li key={`${g.url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg bg-paper">
                    <Img src={g.url} alt="" sizes="100px" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => set(['gallery'], draft.gallery.filter((_, j) => j !== i))} className="absolute top-1 right-1 rounded-md bg-white/90 px-1.5 text-xs font-semibold text-danger opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <Button tone="secondary" className="mt-2" onClick={() => setGalleryPicker(true)} disabled={draft.gallery.length >= 12}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add to gallery
              </Button>
              <MediaPicker open={galleryPicker} onClose={() => setGalleryPicker(false)} onPick={(img) => set(['gallery'], [...draft.gallery, img])} />
            </div>
          </Section>
          <Section title="Related products" description="Shown at the bottom of the product page. If none are chosen, products from the same category are shown.">
            <ul className="space-y-2">
              {all.data
                ?.filter((p) => p._id !== id)
                .map((p) => {
                  const checked = draft.relatedProducts.includes(p._id);
                  return (
                    <li key={p._id}>
                      <label className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={checked} onChange={() => set(['relatedProducts'], checked ? draft.relatedProducts.filter((x) => x !== p._id) : [...draft.relatedProducts, p._id])} className="h-4 w-4 accent-[#2868A0]" />
                        <span>
                          <span className="font-semibold">{p.code}</span> {p.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}
