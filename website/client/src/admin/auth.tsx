import { createContext, useContext } from 'react';
import { redirect } from 'react-router';
import { api } from '../lib/api';
import type { AdminUser } from '../lib/types';

export const AuthContext = createContext<AdminUser | null>(null);

export function useAdmin(): AdminUser {
  const user = useContext(AuthContext);
  if (!user) throw new Error('useAdmin must be used inside the admin layout');
  return user;
}

/** Loader for protected admin routes: no session → sign-in page, remembering where to return. */
export async function requireAdmin({ request }: { request: Request }) {
  const { user } = await api.get<{ user: AdminUser | null }>('/api/admin/auth/me', request.signal);
  if (!user) throw redirect(`/admin/login?next=${encodeURIComponent(new URL(request.url).pathname)}`);
  return user;
}

export async function signOut() {
  try {
    await api.post('/api/admin/auth/logout');
  } finally {
    window.location.assign('/admin/login');
  }
}
