import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { passwordSchema, userCreateInput, type Role } from '@shared/schemas';
import { api, ApiError } from '../../lib/api';
import { useAdmin } from '../auth';
import { Button, ConfirmDialog, ErrorNote, formatDate, Modal, PageHeader, SelectInput, Spinner, Switch, TextInput, useResource, useToast } from '../ui';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const blank = { name: '', email: '', role: 'editor' as Role, password: '' };

export default function Users() {
  const me = useAdmin();
  const toast = useToast();
  const { data, error, loading, reload } = useResource<UserRow[]>(me.role === 'admin' ? '/api/admin/users' : null);
  const [creating, setCreating] = useState<typeof blank | null>(null);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  if (me.role !== 'admin') return <ErrorNote error={new Error('Only administrators can manage users.')} />;

  const create = async () => {
    if (!creating) return;
    const check = userCreateInput.safeParse(creating);
    if (!check.success) return setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
    setBusy(true);
    try {
      await api.post('/api/admin/users', creating);
      toast('success', `${creating.name} can now sign in.`);
      setCreating(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError) setErrors(Object.fromEntries(err.issues.map((i) => [i.path, i.message])));
      toast('error', err instanceof ApiError ? err.message : 'Could not create the user.');
    } finally {
      setBusy(false);
    }
  };

  const update = async (u: UserRow, patch: Partial<{ role: Role; isActive: boolean; password: string }>, message: string) => {
    try {
      await api.put(`/api/admin/users/${u._id}`, patch);
      toast('success', message);
      reload();
      return true;
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not update the user.');
      return false;
    }
  };

  const resetPassword = async () => {
    if (!resetFor) return;
    const check = passwordSchema.safeParse(newPassword);
    if (!check.success) return setErrors({ password: check.error.issues[0].message });
    setBusy(true);
    if (await update(resetFor, { password: newPassword }, `Password changed for ${resetFor.name}. They have been signed out everywhere.`)) setResetFor(null);
    setBusy(false);
  };

  const remove = async () => {
    if (!pending) return;
    try {
      await api.delete(`/api/admin/users/${pending._id}`);
      toast('success', `${pending.name} removed.`);
      reload();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not remove the user.');
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Administrators can do everything. Editors manage products, pages, media and inquiries, but cannot delete content or manage users."
        actions={
          <Button
            onClick={() => {
              setErrors({});
              setCreating({ ...blank });
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add user
          </Button>
        }
      />
      {error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-navy/10 bg-paper text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">User</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Active</th>
                <th scope="col" className="px-4 py-3 font-medium">Last sign-in</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data?.map((u) => {
                const self = u._id === me.id;
                return (
                  <tr key={u._id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {u.name} {self && <span className="text-xs font-normal text-muted">(you)</span>}
                      </p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`role-${u._id}`}>
                        Role for {u.name}
                      </label>
                      <select id={`role-${u._id}`} value={u.role} disabled={self} onChange={(e) => update(u, { role: e.target.value as Role }, 'Role updated.')} className="rounded-lg border border-navy/15 bg-white px-2 py-1.5 text-sm disabled:opacity-60">
                        <option value="admin">Administrator</option>
                        <option value="editor">Editor</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={u.isActive} disabled={self} onChange={(v) => update(u, { isActive: v }, v ? 'User reactivated.' : 'User deactivated and signed out.')} label={u.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(u.lastLoginAt, true)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          tone="ghost"
                          onClick={() => {
                            setErrors({});
                            setNewPassword('');
                            setResetFor(u);
                          }}
                        >
                          Reset password
                        </Button>
                        {!self && (
                          <button type="button" onClick={() => setPending(u)} className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remove {u.name}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!creating} onClose={() => setCreating(null)} title="Add a dashboard user">
        {creating && (
          <div className="space-y-5">
            <TextInput label="Full name" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} error={errors.name} />
            <TextInput label="Email" type="email" autoComplete="off" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} error={errors.email} />
            <SelectInput label="Role" value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value as Role })}>
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </SelectInput>
            <TextInput label="Temporary password" type="password" autoComplete="new-password" value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} error={errors.password} help="At least 12 characters with upper- and lowercase letters and a number. Share it securely." />
            <div className="flex justify-end gap-2">
              <Button tone="secondary" onClick={() => setCreating(null)}>
                Cancel
              </Button>
              <Button onClick={create} busy={busy}>
                Add user
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!resetFor} onClose={() => setResetFor(null)} title={`Reset password for ${resetFor?.name ?? ''}`}>
        <div className="space-y-5">
          <TextInput label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.password} help="They will be signed out of every device." />
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setResetFor(null)}>
              Cancel
            </Button>
            <Button onClick={resetPassword} busy={busy}>
              Change password
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!pending} title={`Remove ${pending?.name ?? 'user'}?`} body="They will no longer be able to sign in. Notes they wrote on inquiries are kept." confirmLabel="Remove" onCancel={() => setPending(null)} onConfirm={remove} />
    </>
  );
}
