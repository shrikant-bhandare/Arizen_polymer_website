import { Plus } from 'lucide-react';
import { useState } from 'react';
import { siteSettingsInput } from '@shared/schemas';
import { api, ApiError } from '../../lib/api';
import type { SiteSettings } from '../../lib/types';
import { useAdmin } from '../auth';
import { RowControls, move, Section, SeoEditor, StringsEditor } from '../editors';
import { ImageField } from '../media';
import { Button, ErrorNote, PageHeader, Spinner, Switch, TextArea, TextInput, useDraft, useResource, useToast, useUnsavedWarning } from '../ui';

type Settings = SiteSettings & { notificationEmails: string[] };

export default function SettingsPage() {
  const user = useAdmin();
  const toast = useToast();
  const { data, error, loading, reload } = useResource<Settings>('/api/admin/settings');
  const { draft, set, errors, setErrors, failWith, dirty, setDirty } = useDraft<Settings>(data);
  const [saving, setSaving] = useState(false);
  useUnsavedWarning(dirty);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading || !draft) return <Spinner />;

  const save = async () => {
    const check = siteSettingsInput.safeParse(draft);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      toast('error', 'Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/admin/settings', check.data);
      setDirty(false);
      toast('success', 'Settings saved.');
    } catch (err) {
      failWith(err);
      toast('error', err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };
  const e = errors;

  return (
    <>
      <PageHeader title="Settings" description="Company details, contact information, inquiry notifications and search defaults." actions={<Button onClick={save} busy={saving}>Save settings</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Company">
          <TextInput label="Company name" value={draft.companyName} max={120} onChange={(ev) => set(['companyName'], ev.target.value)} error={e.companyName} />
          <TextInput label="Short name" value={draft.shortName} max={60} onChange={(ev) => set(['shortName'], ev.target.value)} error={e.shortName} help="Used in page titles, e.g. “Products | Arizen Polymers”." />
          <ImageField label="Official logo" value={draft.logo} onChange={(v) => set(['logo'], v)} error={e['logo.url']} help="Replaces the temporary wordmark in the header. A wide PNG or WebP with a transparent background works best." />
        </Section>

        <Section title="Contact details" description="Shown in the footer and on the Contact page. Empty fields show as placeholders.">
          <TextArea label="Business address" value={draft.address} max={400} rows={3} onChange={(ev) => set(['address'], ev.target.value)} error={e.address} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Business email" type="email" value={draft.email} onChange={(ev) => set(['email'], ev.target.value)} error={e.email} />
            <TextInput label="Phone number" value={draft.phone} placeholder="+91 …" onChange={(ev) => set(['phone'], ev.target.value)} error={e.phone} />
            <TextInput label="WhatsApp number" value={draft.whatsapp} placeholder="+91 …" onChange={(ev) => set(['whatsapp'], ev.target.value)} error={e.whatsapp} />
            <TextInput label="Business hours" value={draft.businessHours} max={160} placeholder="Mon–Sat, 9:30–18:30" onChange={(ev) => set(['businessHours'], ev.target.value)} />
          </div>
          <TextInput label="Map location" value={draft.mapQuery} max={300} onChange={(ev) => set(['mapQuery'], ev.target.value)} help="What to search for on Google Maps. Leave blank to use the address." />
        </Section>

        <Section title="Inquiry notifications" description="Who receives an email for every new website inquiry.">
          {user.role === 'admin' ? (
            <StringsEditor label="Notification recipients" value={draft.notificationEmails} onChange={(v) => set(['notificationEmails'], v)} placeholder="sales@company.com" />
          ) : (
            <p className="text-sm text-muted">Only administrators can change notification recipients. Currently: {draft.notificationEmails.join(', ') || 'none'}.</p>
          )}
          {e.notificationEmails && <p className="text-xs text-danger">{e.notificationEmails}</p>}
          {Object.keys(e)
            .filter((k) => k.startsWith('notificationEmails.'))
            .map((k) => (
              <p key={k} className="text-xs text-danger">
                Recipient {Number(k.split('.')[1]) + 1}: {e[k]}
              </p>
            ))}
        </Section>

        <Section title="Social links">
          {draft.social.map((s, i) => (
            <div key={i} className="flex gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
                <input aria-label={`Social link ${i + 1} label`} placeholder="LinkedIn" value={s.label} onChange={(ev) => set(['social', i, 'label'], ev.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue" />
                <input aria-label={`Social link ${i + 1} URL`} placeholder="https://…" value={s.href} onChange={(ev) => set(['social', i, 'href'], ev.target.value)} aria-invalid={e[`social.${i}.href`] ? true : undefined} className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-blue aria-[invalid=true]:border-danger" />
              </div>
              <RowControls index={i} count={draft.social.length} label="link" onMove={(to) => set(['social'], move(draft.social, i, to))} onRemove={() => set(['social'], draft.social.filter((_, j) => j !== i))} />
            </div>
          ))}
          <Button tone="secondary" onClick={() => set(['social'], [...draft.social, { label: '', href: '' }])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add link
          </Button>
        </Section>

        <Section title="Search engines">
          <TextInput label="Public website address" value={draft.siteUrl} placeholder="https://www.example.com" onChange={(ev) => set(['siteUrl'], ev.target.value)} error={e.siteUrl} help="Used for canonical links, the sitemap and sharing previews." />
          <SeoEditor value={draft.defaultSeo} onChange={(v) => set(['defaultSeo'], v)} errors={Object.fromEntries(Object.entries(e).map(([k, v]) => [k.replace('defaultSeo.', 'seo.'), v]))} path="/" fallbackTitle={draft.companyName} fallbackDescription="" />
        </Section>

        <Section title="Launch readiness">
          <Switch checked={draft.showPlaceholders} onChange={(v) => set(['showPlaceholders'], v)} label="Show “To be provided” placeholders" help="Keep on while content is being collected. Turn off at launch to hide any sections that are still empty." />
        </Section>
      </div>
    </>
  );
}
