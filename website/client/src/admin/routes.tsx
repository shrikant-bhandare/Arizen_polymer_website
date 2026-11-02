import type { RouteObject } from 'react-router';
import { requireAdmin } from './auth';

const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

/** The dashboard is code-split away from the public site; visitors never download it. */
export const adminRoutes: RouteObject = {
  path: '/admin',
  children: [
    { path: 'login', lazy: page(() => import('./pages/Login')) },
    {
      id: 'admin',
      loader: requireAdmin,
      lazy: page(() => import('./AdminLayout')),
      HydrateFallback: () => null,
      children: [
        { index: true, lazy: page(() => import('./pages/Dashboard')) },
        { path: 'inquiries', lazy: page(() => import('./pages/Inquiries')) },
        { path: 'inquiries/:id', lazy: page(() => import('./pages/InquiryDetail')) },
        { path: 'products', lazy: page(() => import('./pages/Products')) },
        { path: 'products/:id', lazy: page(() => import('./pages/ProductEditor')) },
        { path: 'categories', lazy: page(() => import('./pages/Categories')) },
        { path: 'content', lazy: page(() => import('./pages/ContentList')) },
        { path: 'content/:key', lazy: page(() => import('./pages/ContentEditor')) },
        { path: 'media', lazy: page(() => import('./pages/Media')) },
        { path: 'settings', lazy: page(() => import('./pages/Settings')) },
        { path: 'users', lazy: page(() => import('./pages/Users')) },
        { path: '*', lazy: page(() => import('./pages/AdminNotFound')) },
      ],
    },
  ],
};
