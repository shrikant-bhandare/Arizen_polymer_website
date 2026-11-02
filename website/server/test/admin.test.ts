import type { Express } from 'express';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ADMIN, EDITOR, signIn, startTestServer, stopTestServer, validInquiry } from './helpers';

let app: Express;
beforeAll(async () => {
  app = await startTestServer();
});
afterAll(stopTestServer);

const newProduct = (over: Record<string, unknown> = {}) => ({
  name: 'Test Polymer',
  code: 'TP',
  slug: 'test-polymer',
  status: 'draft',
  specifications: [{ property: 'Melt flow index', value: '8', unit: 'g/10 min', testMethod: 'ASTM D1238' }],
  grades: [{ name: 'TP-100', description: 'General purpose' }],
  applications: ['Testing'],
  ...over,
});

describe('authentication and authorisation', () => {
  it('rejects wrong passwords without revealing which part was wrong', async () => {
    const wrong = await request(app).post('/api/admin/auth/login').send({ email: ADMIN.email, password: 'nope' }).expect(401);
    const unknown = await request(app).post('/api/admin/auth/login').send({ email: 'ghost@test.local', password: 'nope' }).expect(401);
    expect(wrong.body.error).toBe(unknown.body.error);
  });

  it('sets an httpOnly, SameSite=Strict session cookie', async () => {
    const { cookies } = await signIn(app);
    const session = cookies.find((c) => c.startsWith('arz_session='))!;
    expect(session).toMatch(/HttpOnly/i);
    expect(session).toMatch(/SameSite=Strict/i);
    expect(cookies.find((c) => c.startsWith('arz_csrf='))).not.toMatch(/HttpOnly/i);
  });

  it('blocks every admin endpoint without a session', async () => {
    for (const url of ['/api/admin/dashboard', '/api/admin/products', '/api/admin/inquiries', '/api/admin/media', '/api/admin/settings', '/api/admin/users']) {
      await request(app).get(url).expect(401);
    }
    await request(app).get('/api/admin/products').set('Cookie', 'arz_session=forged.token.value').expect(401);
  });

  it('requires the CSRF token on state-changing requests', async () => {
    const { agent, csrf } = await signIn(app);
    await agent.post('/api/admin/products').send(newProduct({ slug: 'csrf-check' })).expect(403);
    await agent.post('/api/admin/products').set('x-csrf-token', 'x'.repeat(64)).send(newProduct({ slug: 'csrf-check' })).expect(403);
    await agent.post('/api/admin/products').set('x-csrf-token', csrf).send(newProduct({ slug: 'csrf-check' })).expect(201);
  });

  it('enforces roles: editors cannot delete or manage users', async () => {
    const { agent, csrf } = await signIn(app, EDITOR);
    await agent.get('/api/admin/users').expect(403);
    const products = (await agent.get('/api/admin/products').expect(200)).body;
    await agent.delete(`/api/admin/products/${products[0]._id}`).set('x-csrf-token', csrf).expect(403);
  });

  it('revokes all sessions on sign-out', async () => {
    const { agent, csrf, cookies } = await signIn(app, EDITOR);
    await agent.post('/api/admin/auth/logout').set('x-csrf-token', csrf).expect(204);
    const session = cookies.find((c) => c.startsWith('arz_session='))!.split(';')[0];
    expect((await request(app).get('/api/admin/auth/me').set('Cookie', session).expect(200)).body.user).toBeNull();
    await request(app).get('/api/admin/dashboard').set('Cookie', session).expect(401);
  });
});

describe('products and categories', () => {
  it('creates, edits, publishes and deletes a product', async () => {
    const { agent, csrf } = await signIn(app);
    const created = (await agent.post('/api/admin/products').set('x-csrf-token', csrf).send(newProduct()).expect(201)).body;
    await request(app).get('/api/products/test-polymer').expect(404); // drafts are private

    await agent.patch(`/api/admin/products/${created._id}/status`).set('x-csrf-token', csrf).send({ status: 'published' }).expect(200);
    const live = (await request(app).get('/api/products/test-polymer').expect(200)).body;
    expect(live.specifications[0].testMethod).toBe('ASTM D1238');
    expect(live.grades[0].name).toBe('TP-100');

    await agent.put(`/api/admin/products/${created._id}`).set('x-csrf-token', csrf).send(newProduct({ name: 'Renamed Polymer', status: 'published' })).expect(200);
    expect((await request(app).get('/api/products/test-polymer')).body.name).toBe('Renamed Polymer');

    await agent.delete(`/api/admin/products/${created._id}`).set('x-csrf-token', csrf).expect(204);
    await request(app).get('/api/products/test-polymer').expect(404);
  });

  it('validates product input strictly', async () => {
    const { agent, csrf } = await signIn(app);
    const bad = await agent.post('/api/admin/products').set('x-csrf-token', csrf).send(newProduct({ slug: 'Bad Slug!', image: { url: 'javascript:alert(1)', alt: '' } })).expect(400);
    expect(bad.body.issues.map((i: { path: string }) => i.path)).toEqual(expect.arrayContaining(['slug', 'image.url']));
    await agent.post('/api/admin/products').set('x-csrf-token', csrf).send(newProduct({ slug: 'unknown-field', isAdmin: true })).expect(400);
    await agent.post('/api/admin/products').set('x-csrf-token', csrf).send(newProduct({ slug: 'hips' })).expect(409);
  });

  it('manages categories and protects categories in use', async () => {
    const { agent, csrf } = await signIn(app);
    const cat = (await agent.post('/api/admin/categories').set('x-csrf-token', csrf).send({ name: 'Engineering Plastics', slug: 'engineering-plastics' }).expect(201)).body;
    const all = (await agent.get('/api/admin/categories').expect(200)).body;
    const styrenics = all.find((c: { slug: string }) => c.slug === 'styrenics');
    expect(styrenics.productCount).toBe(3);
    await agent.delete(`/api/admin/categories/${styrenics._id}`).set('x-csrf-token', csrf).expect(409);

    const reordered = (await agent.put('/api/admin/categories/reorder').set('x-csrf-token', csrf).send({ ids: [cat._id, ...all.filter((c: { _id: string }) => c._id !== cat._id).map((c: { _id: string }) => c._id)] }).expect(200)).body;
    expect(reordered[0].slug).toBe('engineering-plastics');
    await agent.delete(`/api/admin/categories/${cat._id}`).set('x-csrf-token', csrf).expect(204);
  });
});

describe('content and settings', () => {
  it('updates page content and the public site reflects it', async () => {
    const { agent, csrf } = await signIn(app, EDITOR);
    const home = (await agent.get('/api/admin/content/home').expect(200)).body;
    home.hero.supporting = 'Updated supporting line.';
    await agent.put('/api/admin/content/home').set('x-csrf-token', csrf).send(home).expect(200);
    expect((await request(app).get('/api/content/home')).body.hero.supporting).toBe('Updated supporting line.');
    const list = (await agent.get('/api/admin/content').expect(200)).body;
    expect(list.find((c: { key: string }) => c.key === 'home').updatedBy).toBe(EDITOR.name);
  });

  it('rejects unsafe links and unknown fields in content', async () => {
    const { agent, csrf } = await signIn(app);
    const home = (await agent.get('/api/admin/content/home')).body;
    await agent.put('/api/admin/content/home').set('x-csrf-token', csrf).send({ ...home, hero: { ...home.hero, primaryCta: { label: 'x', href: 'javascript:alert(1)' } } }).expect(400);
    await agent.put('/api/admin/content/home').set('x-csrf-token', csrf).send({ ...home, injected: '<script>' }).expect(400);
    const nav = (await agent.get('/api/admin/content/navigation')).body;
    nav.items[0].href = 'data:text/html,<script>alert(1)</script>';
    await agent.put('/api/admin/content/navigation').set('x-csrf-token', csrf).send(nav).expect(400);
  });

  it('lets only administrators change notification recipients', async () => {
    const editor = await signIn(app, EDITOR);
    const settings = (await editor.agent.get('/api/admin/settings')).body;
    const saved = (await editor.agent.put('/api/admin/settings').set('x-csrf-token', editor.csrf).send({ ...settings, phone: '+91 22 1234 5678', notificationEmails: ['attacker@example.com'] }).expect(200)).body;
    expect(saved.phone).toBe('+91 22 1234 5678');
    expect(saved.notificationEmails).not.toContain('attacker@example.com');

    const admin = await signIn(app);
    const updated = (await admin.agent.put('/api/admin/settings').set('x-csrf-token', admin.csrf).send({ ...saved, notificationEmails: ['sales@test.local'] }).expect(200)).body;
    expect(updated.notificationEmails).toEqual(['sales@test.local']);
  });
});

describe('inquiry management', () => {
  it('filters, updates status with an audit note, adds notes and exports CSV', async () => {
    await request(app).post('/api/inquiries').send({ ...validInquiry, companyName: 'Filter Target Ltd', product: 'hdpe' }).expect(201);
    await request(app).post('/api/inquiries').send({ ...validInquiry, companyName: '=HYPERLINK("http://evil")', product: 'abs' }).expect(201);
    const { agent, csrf } = await signIn(app);

    const hdpe = (await agent.get('/api/products/hdpe')).body;
    const byProduct = (await agent.get(`/api/admin/inquiries?product=${hdpe._id}`).expect(200)).body;
    expect(byProduct.items.every((i: { productName: string }) => i.productName === 'High-Density Polyethylene')).toBe(true);
    const today = new Date().toISOString().slice(0, 10);
    expect((await agent.get(`/api/admin/inquiries?from=${today}&to=${today}`).expect(200)).body.total).toBeGreaterThan(0);
    expect((await agent.get('/api/admin/inquiries?from=2000-01-01&to=2000-01-02').expect(200)).body.total).toBe(0);
    await agent.get('/api/admin/inquiries?status=not-a-status').expect(400);
    await agent.get('/api/admin/inquiries?limit=5000').expect(400);

    const target = byProduct.items.find((i: { companyName: string }) => i.companyName === 'Filter Target Ltd');
    await agent.patch(`/api/admin/inquiries/${target._id}`).set('x-csrf-token', csrf).send({ status: 'quotation_sent' }).expect(200);
    await agent.post(`/api/admin/inquiries/${target._id}/notes`).set('x-csrf-token', csrf).send({ text: 'Sent grade sheet.' }).expect(201);
    const detail = (await agent.get(`/api/admin/inquiries/${target._id}`).expect(200)).body;
    expect(detail.status).toBe('quotation_sent');
    expect(detail.notes.map((n: { kind: string }) => n.kind)).toEqual(['status', 'note']);
    expect((await agent.get('/api/admin/inquiries?status=quotation_sent')).body.total).toBe(1);

    const csv = await agent.get('/api/admin/inquiries/export.csv').expect(200);
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.text).toContain('"\'=HYPERLINK(""http://evil"")"');
    expect(csv.text).toContain('Sent grade sheet.');
  });

  it('shows dashboard totals', async () => {
    const { agent } = await signIn(app);
    const d = (await agent.get('/api/admin/dashboard').expect(200)).body;
    expect(d.totalProducts).toBeGreaterThanOrEqual(4);
    expect(d.activeCategories).toBeGreaterThanOrEqual(2);
    expect(d.totalInquiries).toBeGreaterThan(0);
    expect(d.recentInquiries.length).toBeGreaterThan(0);
    expect(d.recentUpdates.length).toBeGreaterThan(0);
  });
});

describe('media library', () => {
  const png = () => sharp({ create: { width: 1200, height: 800, channels: 3, background: '#2868A0' } }).png().toBuffer();

  it('re-encodes uploads into WebP and AVIF variants', async () => {
    const { agent, csrf } = await signIn(app, EDITOR);
    const res = await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', await png(), { filename: 'plant.png', contentType: 'image/png' }).field('alt', 'Blue test image').expect(201);
    expect(res.body.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[0-9a-f-]+\.webp$/);
    expect(res.body.variants.map((v: { format: string }) => v.format)).toEqual(expect.arrayContaining(['webp', 'avif']));
    expect(res.body.alt).toBe('Blue test image');
    const served = await request(app).get(res.body.url).expect(200);
    expect(served.headers['content-type']).toBe('image/webp');
  });

  it('rejects disguised, unsupported and oversized files', async () => {
    const { agent, csrf } = await signIn(app);
    await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', Buffer.from('<?php echo 1; ?>'), { filename: 'shell.png', contentType: 'image/png' }).expect(400);
    await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', Buffer.from('<svg onload="alert(1)"/>'), { filename: 'x.svg', contentType: 'image/svg+xml' }).expect(400);
    await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', Buffer.alloc(11 * 1024 * 1024), { filename: 'big.png', contentType: 'image/png' }).expect(413);
  });

  it('warns before deleting an image that is in use', async () => {
    const { agent, csrf } = await signIn(app);
    const asset = (await agent.post('/api/admin/media').set('x-csrf-token', csrf).attach('file', await png(), { filename: 'used.png', contentType: 'image/png' }).expect(201)).body;
    const home = (await agent.get('/api/admin/content/home')).body;
    home.infrastructure.image = { url: asset.url, alt: 'Plant' };
    await agent.put('/api/admin/content/home').set('x-csrf-token', csrf).send(home).expect(200);

    expect((await agent.get(`/api/admin/media/${asset._id}/usage`).expect(200)).body.usage).toContain('Page content: home');
    const blocked = await agent.delete(`/api/admin/media/${asset._id}`).set('x-csrf-token', csrf).expect(409);
    expect(blocked.body.details.usage).toContain('Page content: home');
    await agent.delete(`/api/admin/media/${asset._id}?force=true`).set('x-csrf-token', csrf).expect(204);
    await request(app).get(asset.url).expect(404);
  });
});

describe('user management', () => {
  it('creates users with strong passwords only and protects the last administrator', async () => {
    const { agent, csrf } = await signIn(app);
    await agent.post('/api/admin/users').set('x-csrf-token', csrf).send({ name: 'Weak', email: 'weak@test.local', role: 'editor', password: 'password' }).expect(400);
    const created = (await agent.post('/api/admin/users').set('x-csrf-token', csrf).send({ name: 'New Editor', email: 'new@test.local', role: 'editor', password: 'Strong-Pass-12345' }).expect(201)).body;
    expect(created).not.toHaveProperty('passwordHash');

    const users = (await agent.get('/api/admin/users').expect(200)).body;
    const me = users.find((u: { email: string }) => u.email === ADMIN.email);
    await agent.delete(`/api/admin/users/${me._id}`).set('x-csrf-token', csrf).expect(409);
    await agent.put(`/api/admin/users/${me._id}`).set('x-csrf-token', csrf).send({ role: 'editor' }).expect(409);

    await agent.put(`/api/admin/users/${created._id}`).set('x-csrf-token', csrf).send({ isActive: false }).expect(200);
    await request(app).post('/api/admin/auth/login').send({ email: 'new@test.local', password: 'Strong-Pass-12345' }).expect(401);
  });
});
