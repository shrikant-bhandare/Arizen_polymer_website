/**
 * Build used by Vercel (see /vercel.json): `npm run build:vercel` in website/.
 *
 * 1. Builds the website with Vite into client/dist (served by Vercel's CDN).
 * 2. Bundles the Express app into server/dist/vercel.js (the serverless function).
 * 3. Renames client/dist/index.html to app-shell.html, so the CDN never serves
 *    the bare shell: page requests fall through to the function, which renders
 *    each page's SEO tags and embedded data into the shell.
 *
 * Type checking is not repeated here; run `npm run typecheck` and `npm test` before pushing.
 */
import { execSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (cmd, cwd) => execSync(cmd, { cwd: `${root}${cwd}`, stdio: 'inherit' });

run('npx vite build', 'client');
run('npx tsup', 'server');

const dist = `${root}client/dist`;
if (existsSync(`${dist}/index.html`)) renameSync(`${dist}/index.html`, `${dist}/app-shell.html`);
if (!existsSync(`${dist}/app-shell.html`) || !existsSync(`${root}server/dist/vercel.js`)) {
  throw new Error('Vercel build is incomplete: app shell or function bundle missing.');
}
console.log('Vercel build ready: static files in client/dist, function in server/dist/vercel.js');
