import { ArrowLeft, ChevronDown, ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { contentPages, contentSchemas, type ContentKey } from '@shared/content';
import { defaultsFor, type Field } from '@shared/fields';
import type { SeoFields } from '@shared/content';
import { api, ApiError } from '../../lib/api';
import { move, ParagraphsEditor, RowControls, SeoEditor, StringsEditor } from '../editors';
import { ImageField } from '../media';
import { Button, ErrorNote, PageHeader, Spinner, Switch, TextArea, TextInput, useDraft, useResource, useToast, useUnsavedWarning } from '../ui';

type Value = Record<string, unknown>;
type Path = (string | number)[];

interface RendererProps {
  fields: Field[];
  value: Value;
  path: Path;
  set: (path: Path, v: unknown) => void;
  errors: Record<string, string>;
  pagePath: string;
}

/** Renders an editing form for any page, straight from its field descriptors in shared/content.ts. */
function Fields({ fields, value, path, set, errors, pagePath }: RendererProps) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <FieldRenderer key={f.key} field={f} value={value[f.key]} path={[...path, f.key]} set={set} errors={errors} pagePath={pagePath} />
      ))}
    </div>
  );
}

function FieldRenderer({ field: f, value, path, set, errors, pagePath }: { field: Field; value: unknown; path: Path; set: RendererProps['set']; errors: Record<string, string>; pagePath: string }) {
  const key = path.join('.');
  const err = errors[key] ?? errors[`${key}.url`] ?? errors[`${key}.href`];
  switch (f.type) {
    case 'text':
      return f.multiline ? (
        <TextArea label={f.label} help={f.help} value={(value as string) ?? ''} max={f.max} error={err} onChange={(e) => set(path, e.target.value)} />
      ) : (
        <TextInput label={f.label} help={f.help} value={(value as string) ?? ''} max={f.max} placeholder={f.placeholder} error={err} onChange={(e) => set(path, e.target.value)} />
      );
    case 'paragraphs':
      return <ParagraphsEditor label={f.label} help={f.help} value={(value as string[]) ?? []} error={err} onChange={(v) => set(path, v)} />;
    case 'strings':
      return <StringsEditor label={f.label} help={f.help} value={(value as string[]) ?? []} onChange={(v) => set(path, v)} />;
    case 'image':
      return <ImageField label={f.label} help={f.help} value={(value as { url: string; alt: string }) ?? { url: '', alt: '' }} error={err} onChange={(v) => set(path, v)} />;
    case 'link': {
      const link = (value as { label: string; href: string }) ?? { label: '', href: '' };
      return (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-1.5 text-sm font-medium">{f.label}</legend>
          <TextInput label="Label" value={link.label} max={60} onChange={(e) => set([...path, 'label'], e.target.value)} />
          <TextInput label="Link" value={link.href} placeholder="/products" error={errors[`${key}.href`]} onChange={(e) => set([...path, 'href'], e.target.value)} help="A page path such as /contact, or a full https:// address." />
        </fieldset>
      );
    }
    case 'boolean':
      return <Switch checked={Boolean(value)} onChange={(v) => set(path, v)} label={f.label} help={f.help} />;
    case 'seo':
      return <SeoEditor value={value as SeoFields} onChange={(v) => set(path, v)} errors={Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith(key)).map(([k, v]) => [k.replace(`${key}.`, 'seo.'), v]))} path={pagePath} fallbackTitle="Arizen Polymers India Private Limited" fallbackDescription="" />;
    case 'group':
      return <Group title={f.label} help={f.help} fields={f.fields} value={(value as Value) ?? {}} path={path} set={set} errors={errors} pagePath={pagePath} />;
    case 'list': {
      const items = (value as Value[]) ?? [];
      const label = f.itemLabel ?? 'Item';
      return (
        <fieldset>
          <legend className="mb-1 text-sm font-medium">{f.label}</legend>
          {f.help && <p className="mb-3 text-xs text-muted">{f.help}</p>}
          <ol className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="rounded-lg border border-navy/10 bg-paper/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {label} {i + 1}
                  </span>
                  <RowControls index={i} count={items.length} label={label.toLowerCase()} onMove={(to) => set(path, move(items, i, to))} onRemove={() => set(path, items.filter((_, j) => j !== i))} />
                </div>
                <Fields fields={f.item} value={item} path={[...path, i]} set={set} errors={errors} pagePath={pagePath} />
              </li>
            ))}
          </ol>
          <Button tone="secondary" className="mt-3" disabled={items.length >= (f.max ?? 30)} onClick={() => set(path, [...items, defaultsFor(f.item)])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add {label.toLowerCase()}
          </Button>
        </fieldset>
      );
    }
  }
}

function Group({ title, help, ...props }: { title: string; help?: string } & RendererProps) {
  const [open, setOpen] = useState(true);
  const hasError = Object.keys(props.errors).some((k) => k.startsWith(props.path.join('.')));
  return (
    <section className={`rounded-xl border bg-white ${hasError ? 'border-danger/40' : 'border-navy/10'}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span>
          <span className="font-display font-bold tracking-tight">{title}</span>
          {help && <span className="block text-xs text-muted">{help}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="border-t border-navy/10 px-5 py-5">
          <Fields {...props} />
        </div>
      )}
    </section>
  );
}

export default function ContentEditor() {
  const key = useParams().key as ContentKey;
  const page = contentPages[key];
  const toast = useToast();
  const { data, error, loading, reload } = useResource<Value>(page ? `/api/admin/content/${key}` : null);
  const { draft, set, errors, setErrors, failWith, dirty, setDirty } = useDraft<Value>(data);
  const [saving, setSaving] = useState(false);
  useUnsavedWarning(dirty);

  if (!page) return <ErrorNote error={new Error('Unknown page.')} />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading || !draft) return <Spinner />;

  const save = async () => {
    const check = contentSchemas[key].safeParse(draft);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      toast('error', 'Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/api/admin/content/${key}`, check.data);
      setDirty(false);
      toast('success', `${page.label} saved. Changes are live within a minute.`);
    } catch (err) {
      failWith(err);
      toast('error', err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  // Top-level text/list fields sit together in one card; groups get their own cards.
  const loose = page.fields.filter((f) => f.type !== 'group');
  const groups = page.fields.filter((f) => f.type === 'group');

  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/content" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All pages
          </Link>
        }
        title={page.label}
        description={dirty ? 'Unsaved changes' : 'Empty fields show as “To be provided” placeholders on the website until filled.'}
        actions={
          <>
            {page.path && (
              <a href={page.path} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 text-sm font-semibold hover:border-navy/40">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> View page
              </a>
            )}
            <Button onClick={save} busy={saving}>
              Save changes
            </Button>
          </>
        }
      />
      <div className="space-y-5">
        {loose.length > 0 && (
          <section className="rounded-xl border border-navy/10 bg-white p-5">
            <Fields fields={loose} value={draft} path={[]} set={set} errors={errors} pagePath={page.path ?? '/'} />
          </section>
        )}
        {groups.map((g) => (
          <FieldRenderer key={g.key} field={g} value={draft[g.key]} path={[g.key]} set={set} errors={errors} pagePath={page.path ?? '/'} />
        ))}
      </div>
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <Button onClick={save} busy={saving} className="shadow-xl">
          Save changes
        </Button>
      </div>
    </>
  );
}
