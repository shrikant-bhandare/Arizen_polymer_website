import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { categoryInput } from '@shared/schemas';
import { Img } from '../../components/ui/Img';
import { api, ApiError } from '../../lib/api';
import type { Category } from '../../lib/types';
import { useAdmin } from '../auth';
import { ImageField } from '../media';
import { Button, ConfirmDialog, EmptyState, ErrorNote, Modal, PageHeader, Spinner, Switch, TextArea, TextInput, useResource, useToast } from '../ui';

type Form = { name: string; slug: string; description: string; image: { url: string; alt: string }; isActive: boolean; order: number };
const empty: Form = { name: '', slug: '', description: '', image: { url: '', alt: '' }, isActive: true, order: 0 };

export default function Categories() {
  const user = useAdmin();
  const toast = useToast();
  const { data, setData, error, loading, reload } = useResource<Category[]>('/api/admin/categories');
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Category | null>(null);

  const open = (c?: Category) => {
    setErrors({});
    setEditing(c ? { id: c._id, form: { name: c.name, slug: c.slug, description: c.description, image: c.image, isActive: c.isActive, order: c.order } } : { id: null, form: { ...empty, order: data?.length ?? 0 } });
  };

  const save = async () => {
    if (!editing) return;
    const check = categoryInput.safeParse(editing.form);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }
    setSaving(true);
    try {
      if (editing.id) await api.put(`/api/admin/categories/${editing.id}`, editing.form);
      else await api.post('/api/admin/categories', editing.form);
      toast('success', 'Category saved.');
      setEditing(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError) setErrors(Object.fromEntries(err.issues.map((i) => [i.path, i.message])));
      toast('error', err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (from: number, to: number) => {
    if (!data || to < 0 || to >= data.length) return;
    const next = [...data];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setData(next);
    try {
      await api.put('/api/admin/categories/reorder', { ids: next.map((c) => c._id) });
    } catch {
      toast('error', 'Could not save the new order.');
      reload();
    }
  };

  const remove = async () => {
    if (!pending) return;
    try {
      await api.delete(`/api/admin/categories/${pending._id}`);
      toast('success', `${pending.name} deleted.`);
      reload();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete.');
    } finally {
      setPending(null);
    }
  };

  const f = editing?.form;
  const setForm = (patch: Partial<Form>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e));

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group products on the Products page. The order here is the order of the filter tabs."
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New category
          </Button>
        }
      />
      {error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title="No categories yet" />
      ) : (
        <ul className="divide-y divide-navy/5 rounded-xl border border-navy/10 bg-white">
          {data.map((c, i) => (
            <li key={c._id} className="flex items-center gap-4 px-4 py-3">
              <span className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper">{c.image?.url && <Img src={c.image.url} alt="" sizes="64px" className="h-full w-full object-cover" />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {c.name} {!c.isActive && <span className="ml-2 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-medium text-muted">Hidden</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  {c.productCount ?? 0} product{c.productCount === 1 ? '' : 's'} · ?category={c.slug}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => reorder(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Move {c.name} up</span>
                </button>
                <button type="button" onClick={() => reorder(i, i + 1)} disabled={i === data.length - 1} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Move {c.name} down</span>
                </button>
                <button type="button" onClick={() => open(c)} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-navy/5 hover:text-navy">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Edit {c.name}</span>
                </button>
                {user.role === 'admin' && (
                  <button type="button" onClick={() => setPending(c)} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Delete {c.name}</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit category' : 'New category'}>
        {f && (
          <div className="space-y-5">
            <TextInput label="Name" value={f.name} max={80} onChange={(e) => setForm({ name: e.target.value, ...(editing?.id ? {} : { slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }) })} error={errors.name} />
            <TextInput label="Slug" value={f.slug} max={80} onChange={(e) => setForm({ slug: e.target.value.toLowerCase() })} error={errors.slug} help="Used in the filter link, e.g. /products?category=styrenics" />
            <TextArea label="Description" value={f.description} max={600} rows={3} onChange={(e) => setForm({ description: e.target.value })} error={errors.description} />
            <ImageField label="Image" value={f.image} onChange={(image) => setForm({ image })} error={errors['image.url']} />
            <Switch checked={f.isActive} onChange={(isActive) => setForm({ isActive })} label="Show on website" />
            <div className="flex justify-end gap-2 pt-2">
              <Button tone="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} busy={saving}>
                Save category
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!pending} title={`Delete ${pending?.name ?? 'category'}?`} body="Categories that still contain products cannot be deleted; move those products first." onCancel={() => setPending(null)} onConfirm={remove} />
    </>
  );
}
