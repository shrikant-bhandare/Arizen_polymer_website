import { MotionConfig } from 'framer-motion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { z } from 'zod';
import { router } from './router';
import './styles.css';

// The Content-Security-Policy forbids eval; tell Zod not to try its eval-based fast path.
z.config({ jitless: true });

// The server renders per-page meta tags for crawlers and link previews. Once the app
// runs, React manages them, so the server copies are removed to avoid duplicates.
document.querySelectorAll('[data-ssr-meta]').forEach((el) => el.remove());
document.querySelector('head > title')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>,
);
