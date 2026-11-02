import type { Express } from 'express';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// This file runs in its own module graph: switch storage to Vercel Blob here only.
process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test_token';

const stored = new Map<string, string>();
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string, _body: Buffer, opts: { contentType: string; addRandomSuffix: boolean }) => {
    expect(opts.addRandomSuffix).toBe(false);
    const url = `https://teststore.public.blob.vercel-storage.com/${pathname}`;
    stored.set(url, opts.contentType);
    return { url, pathname };
  }),
  del: vi.fn(async (urls: string[]) => {
    for (const u of urls) stored.delete(u);
  }),
}));

let app: Express;
beforeAll(async () => {
  const { startTestServer } = await import('./helpers');
  app = await startTestServer();
});
afterAll(async () => {
  const { stopTestServer } = await import('./helpers');
  await stopTestServer();
});

describe('media storage on Vercel Blob', () => {
  it('uploads the master and every variant to Blob with predictable names, and deletes them all', async () => {
    const { signIn } = await import('./helpers');
    const { agent, csrf } = await signIn(app);
    const png = await sharp({ create: { width: 1000, height: 700, channels: 3, background: '#152F48' } }).png().toBuffer();

    const asset = (await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', png, { filename: 'plant.png', contentType: 'image/png' }).expect(201)).body;
    expect(asset.url).toMatch(/^https:\/\/teststore\.public\.blob\.vercel-storage\.com\/uploads\/\d{4}\/\d{2}\/[0-9a-f-]+\.webp$/);
    const base = asset.url.slice(0, -'.webp'.length);
    // The website derives responsive sizes from the master URL, so names must follow the convention.
    for (const w of [480, 960, 1600]) {
      expect(stored.get(`${base}-${w}.webp`)).toBe('image/webp');
      expect(stored.get(`${base}-${w}.avif`)).toBe('image/avif');
    }
    expect(stored.size).toBe(7);

    await agent.delete(`/api/admin/media/${asset._id}`).set('x-csrf-token', csrf).expect(204);
    expect(stored.size).toBe(0);
  });
});
