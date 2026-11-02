import { FileText, FolderTree, Gauge, Image, Inbox, LogOut, Menu, Package, Settings, ExternalLink, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLoaderData, useLocation, useNavigation } from 'react-router';
import type { AdminUser } from '../lib/types';
import { AuthContext, signOut } from './auth';
import { ToastProvider } from './ui';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/content', label: 'Pages', icon: FileText },
  { to: '/admin/media', label: 'Media library', icon: Image },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function AdminLayout() {
  const user = useLoaderData() as AdminUser;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigation = useNavigation();
  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <nav aria-label="Dashboard" className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 font-display text-sm font-extrabold text-cyan">A</span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold">Arizen Polymers</span>
          <span className="block text-[0.7rem] text-silver/65">Website CMS</span>
        </span>
      </div>
      <ul className="mt-4 flex-1 space-y-0.5 px-3">
        {nav
          .filter((n) => !n.adminOnly || user.role === 'admin')
          .map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-silver/65 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
      </ul>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-silver/65 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
        </a>
        <div className="mt-2 rounded-lg bg-white/5 px-3 py-3">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-silver/65">
            {user.email} · {user.role === 'admin' ? 'Administrator' : 'Editor'}
          </p>
          <button type="button" onClick={signOut} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-silver/70 hover:text-white">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <AuthContext.Provider value={user}>
      <ToastProvider>
        <title>Admin | Arizen Polymers</title>
        <meta name="robots" content="noindex, nofollow" />
        <div className="min-h-[100svh] bg-paper text-navy">
          <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy text-white lg:block">{sidebar}</aside>
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
              <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
              <aside className="absolute inset-y-0 left-0 w-72 bg-navy text-white">
                <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-3 grid h-9 w-9 place-items-center rounded-lg text-silver/70">
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Close menu</span>
                </button>
                {sidebar}
              </aside>
            </div>
          )}
          <div className="lg:pl-64">
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-navy/10 bg-white/90 px-4 backdrop-blur lg:hidden">
              <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </button>
              <span className="font-display font-bold">Arizen CMS</span>
            </header>
            {navigation.state === 'loading' && <div className="fixed top-0 right-0 left-0 z-50 h-0.5 animate-pulse bg-cyan lg:left-64" aria-hidden="true" />}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
              <Outlet />
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthContext.Provider>
  );
}
