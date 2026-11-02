/**
 * Local stand-in for Vercel's routing, to test the Vercel build before pushing:
 * static files from client/dist first, everything else to the function in
 * /api/index.mjs (exactly what /vercel.json configures).
 *
 *   npm run build:vercel
 *   PORT=4200 NODE_ENV=production node scripts/vercel-simulate.mjs
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../client/dist/', import.meta.url));
const { default: handler } = await import(new URL('../../api/index.mjs', import.meta.url));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json' };

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(dist, pathname);
  if (file.startsWith(dist) && pathname !== '/' && existsSync(file) && statSync(file).isFile()) {
    res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
    return;
  }
  handler(req, res);
}).listen(Number(process.env.PORT ?? 4200), () => console.log(`Vercel simulation on http://localhost:${process.env.PORT ?? 4200}`));
