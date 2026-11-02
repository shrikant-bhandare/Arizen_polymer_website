/**
 * Renders the print layout of the built proposal to an A4 PDF.
 *
 *   npm run build && npm run pdf      (or: npm run release)
 *
 * Writes the PDF into dist/ (so it ships next to index.html and the
 * "Download PDF" button serves it) and into public/ (so later builds and the
 * dev server include it too).
 */
import { chromium } from 'playwright-core';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const source = fileURLToPath(new URL('dist/index.html', root));
const content = await readFile(fileURLToPath(new URL('src/content/proposal.ts', root)), 'utf8');
const fileName = /pdfFileName:\s*'([^']+)'/.exec(content)?.[1];
if (!fileName) throw new Error('pdfFileName not found in src/content/proposal.ts');

try {
  await stat(source);
} catch {
  throw new Error('dist/index.html not found. Run `npm run build` first.');
}

let browser;
for (const channel of ['msedge', 'chrome']) {
  try {
    browser = await chromium.launch({ channel });
    break;
  } catch {
    // try the next installed browser
  }
}
if (!browser) throw new Error('Neither Microsoft Edge nor Google Chrome could be launched.');

const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(pathToFileURL(source).href, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
await page.evaluate(async () => {
  await document.fonts.ready;
  // Only the print layout's images matter; lazy screen images never load while hidden.
  const images = [...document.querySelectorAll('.print-only img')];
  await Promise.all(images.map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
});

const outDist = fileURLToPath(new URL(`dist/${fileName}`, root));
await page.pdf({ path: outDist, preferCSSPageSize: true, printBackground: true });
await browser.close();

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

await mkdir(fileURLToPath(new URL('public/', root)), { recursive: true });
await copyFile(outDist, fileURLToPath(new URL(`public/${fileName}`, root)));
const { size } = await stat(outDist);
console.log(`PDF written: dist/${fileName} (${Math.round(size / 1024)} KB), copied to public/`);
