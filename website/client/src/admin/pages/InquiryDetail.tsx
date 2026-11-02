import { ArrowLeft, Mail, MessageSquare, Phone, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { inquiryStatuses, inquiryStatusLabels, type InquiryStatus } from '@shared/schemas';
import { api, ApiError } from '../../lib/api';
import { telHref } from '../../lib/site';
import type { Inquiry } from '../../lib/types';
import { useAdmin } from '../auth';
import { StatusPill } from '../StatusPill';
import { Button, Card, ConfirmDialog, ErrorNote, formatDate, PageHeader, Spinner, useResource, useToast } from '../ui';

export default function InquiryDetail() {
  const { id } = useParams();
  const user = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, setData, error, loading, reload } = useResource<Inquiry>(`/api/admin/inquiries/${id}`);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading && !data) return <Spinner />;
  if (error || !data) return <ErrorNote error={error} onRetry={reload} />;

  const product = typeof data.product === 'object' ? data.product : null;

  const changeStatus = async (status: InquiryStatus) => {
    try {
      const updated = await api.patch<Inquiry>(`/api/admin/inquiries/${data._id}`, { status });
      setData({ ...updated, product: data.product });
      toast('success', `Status updated to ${inquiryStatusLabels[status]}.`);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not update the status.');
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const updated = await api.post<Inquiry>(`/api/admin/inquiries/${data._id}/notes`, { text: note.trim() });
      setData({ ...updated, product: data.product });
      setNote('');
      toast('success', 'Note added.');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not add the note.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/api/admin/inquiries/${data._id}`);
      toast('success', 'Inquiry deleted.');
      navigate('/admin/inquiries');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete the inquiry.');
    }
  };

  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/inquiries" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All inquiries
          </Link>
        }
        title={data.companyName}
        description={`Received ${formatDate(data.createdAt, true)} · Ref. ${data._id.slice(-6).toUpperCase()}`}
        actions={<StatusPill status={data.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Requirement">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Product</dt>
                <dd className="mt-1 font-semibold">
                  {product ? (
                    <a href={`/products/${product.slug}`} target="_blank" rel="noopener" className="text-blue hover:text-navy">
                      {data.productName}
                    </a>
                  ) : (
                    data.productName || 'General inquiry'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Required quantity</dt>
                <dd className="mt-1 font-semibold">{data.quantity || '—'}</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-muted">Message</p>
            <p className="mt-1 rounded-lg bg-paper p-4 text-sm leading-relaxed whitespace-pre-wrap">{data.message}</p>
          </Card>

          <Card title="Activity & internal notes" description="Notes are visible only to dashboard users.">
            <ol className="space-y-4">
              {data.notes.length === 0 && <li className="text-sm text-muted">No activity yet.</li>}
              {data.notes.map((n) => (
                <li key={n._id} className="flex gap-3">
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${n.kind === 'status' ? 'bg-blue/10 text-blue' : 'bg-cyan/15 text-[#0f6f7a]'}`}>
                    {n.kind === 'status' ? <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" /> : <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {n.authorName} · {formatDate(n.createdAt, true)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-navy/10 pt-5">
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
                Add a note
              </label>
              <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} placeholder="e.g. Called, shared HIPS grade sheet, follow up on Friday." className="w-full rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/15" />
              <div className="mt-3 flex justify-end">
                <Button onClick={addNote} busy={saving} disabled={!note.trim()}>
                  Add note
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contact">
            <p className="font-semibold">{data.fullName}</p>
            <p className="text-sm text-muted">{data.companyName}</p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`mailto:${data.email}`} className="flex items-center gap-2 break-all text-blue hover:text-navy">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {data.email}
              </a>
              <a href={telHref(data.phone)} className="flex items-center gap-2 text-blue hover:text-navy">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {data.phone}
              </a>
            </div>
          </Card>
          <Card title="Status">
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select id="status" value={data.status} onChange={(e) => changeStatus(e.target.value as InquiryStatus)} className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue">
              {inquiryStatuses.map((s) => (
                <option key={s} value={s}>
                  {inquiryStatusLabels[s]}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-muted">Each change is recorded in the activity log.</p>
          </Card>
          <Card title="Email notification">
            <p className="text-sm">
              {data.notification.sent ? 'Sent to the notification recipients.' : data.notification.error ? <span className="text-warning">{data.notification.error}</span> : 'Pending'}
            </p>
            {data.sourcePath && <p className="mt-2 truncate text-xs text-muted">From: {data.sourcePath}</p>}
          </Card>
          {user.role === 'admin' && (
            <Button tone="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
              Delete inquiry
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} title="Delete this inquiry?" body="The inquiry and its notes will be permanently removed. This cannot be undone." onCancel={() => setConfirmDelete(false)} onConfirm={remove} />
    </>
  );
}
