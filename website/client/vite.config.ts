import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const api = 'http://localhost:4000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': path.resolve(dir, '../shared') } },
  server: {
    port: 5174,
    // In development the API runs separately; the proxy keeps everything same-origin,
    // exactly as in production, so cookies and CSRF behave identically.
    proxy: { '/api': api, '/uploads': api, '/sitemap.xml': api, '/robots.txt': api },
  },
  // The manifest lets the server preload each route's chunk (server/src/services/shell.ts).
  build: { target: 'es2022', assetsInlineLimit: 0, chunkSizeWarningLimit: 700, manifest: true },
});
