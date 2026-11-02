/**
 * Writes the responsive sizes (480/960/1600 px, WebP and AVIF) next to every
 * bundled product image, matching what the server generates for uploads, so
 * the <Img> component can serve both the same way.
 *
 *   node scripts/build-image-variants.mjs
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../server/package.json', import.meta.url));
const sharp = require('sharp');
const dir = fileURLToPath(new URL('../client/public/media/products/', import.meta.url));
const WIDTHS = [480, 960, 1600];

for (const file of await readdir(dir)) {
  if (!/^[a-z0-9-]+\.webp$/.test(file) || /-\d+\.webp$/.test(file)) continue;
  const base = path.join(dir, file.replace(/\.webp$/, ''));
  for (const width of WIDTHS) {
    const img = () => sharp(path.join(dir, file)).resize({ width, withoutEnlargement: true });
    await img().webp({ quality: 80 }).toFile(`${base}-${width}.webp`);
    await img().avif({ quality: 55, effort: 5 }).toFile(`${base}-${width}.avif`);
  }
  console.log('variants:', file);
}
