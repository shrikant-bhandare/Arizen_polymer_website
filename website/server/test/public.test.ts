import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { signIn, startTestServer, stopTestServer, validInquiry } from './helpers';

let app: Express;
beforeAll(async () => {
  app = await startTestServer();
});
afterAll(stopTestServer);

describe('public site API', () => {
  it('serves the site shell without private settings', async () => {
    const res = await request(app).get('/api/site').expect(200);
    expect(res.body.settings.companyName).toBe('Arizen Polymers India Private Limited');
    expect(res.body.settings).not.toHaveProperty('notificationEmails');
    expect(res.body.products.map((p: { slug: string }) => p.slug)).toEqual(['hips', 'abs', 'hdpe', 'polystyrene-granules']);
    expect(res.body.categories).toHaveLength(2);
    expect(res.body.navigation.items.length).toBeGreaterThan(0);
  });

  it('serves public page content but not internal content keys', async () => {
    const home = await request(app).get('/api/content/home').expect(200);
    expect(home.body.hero.headline).toContain('MATERIALS THAT');
    await request(app).get('/api/content/navigation').expect(404);
    await request(app).get('/api/content/__proto__').expect(404);
  });

  it('lists products by category', async () => {
    const res = await request(app).get('/api/products?category=polyolefins').expect(200);
    expect(res.body.map((p: { code: string }) => p.code)).toEqual(['HDPE']);
    await request(app).get('/api/products?category=nope').expect(404);
  });

  it('serves product detail with related products, and 404s otherwise', async () => {
    const res = await request(app).get('/api/products/hips').expect(200);
    expect(res.body.name).toBe('High Impact Polystyrene');
    expect(res.body.category.slug).toBe('styrenics');
    expect(res.body.related).toHaveLength(3);
    expect(res.body.related.map((p: { slug: string }) => p.slug)).not.toContain('hips');
    await request(app).get('/api/products/does-not-exist').expect(404);
    await request(app).get('/api/products/%7B%22%24ne%22%3A1%7D').expect(404);
  });

  it('hides unverified certifications from the public', async () => {
    const { agent, csrf } = await signIn(app);
    const quality = (await agent.get('/api/admin/content/quality')).body;
    quality.certifications.items = [
      { name: 'Verified Standard', issuer: 'Body A', validUntil: '', image: { url: '', alt: '' }, verified: true },
      { name: 'Unverified Claim', issuer: 'Body B', validUntil: '', image: { url: '', alt: '' }, verified: false },
    ];
    await agent.put('/api/admin/content/quality').set('x-csrf-token', csrf).send(quality).expect(200);
    const res = await request(app).get('/api/content/quality').expect(200);
    expect(res.body.certifications.items.map((c: { name: string }) => c.name)).toEqual(['Verified Standard']);
  });
});

describe('inquiry submission', () => {
  it('stores a valid inquiry and links the product', async () => {
    const res = await request(app).post('/api/inquiries').send(validInquiry).expect(201);
    expect(res.body.reference).toMatch(/^[A-F0-9]{6}$/);
    const { agent } = await signIn(app);
    const list = await agent.get('/api/admin/inquiries?q=Example%20Moulders').expect(200);
    expect(list.body.items[0].productName).toBe('High Impact Polystyrene');
    expect(list.body.items[0].status).toBe('new');
  });

  it('accepts a general inquiry without a product', async () => {
    await request(app).post('/api/inquiries').send({ ...validInquiry, product: '', companyName: 'General Co' }).expect(201);
  });

  it('explains validation errors field by field', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...validInquiry, email: 'not-an-email', phone: 'call me', message: 'hi' }).expect(400);
    const paths = res.body.issues.map((i: { path: string }) => i.path);
    expect(paths).toEqual(expect.arrayContaining(['email', 'phone', 'message']));
  });

  it('rejects unknown products and operator injection', async () => {
    await request(app).post('/api/inquiries').send({ ...validInquiry, product: 'imaginary' }).expect(400);
    await request(app).post('/api/inquiries').send({ ...validInquiry, product: { $ne: '' } }).expect(400);
    await request(app).post('/api/inquiries').send({ ...validInquiry, email: { $gt: '' } }).expect(400);
  });

  it('silently discards honeypot and too-fast submissions', async () => {
    const { agent } = await signIn(app);
    const before = (await agent.get('/api/admin/inquiries')).body.total;
    await request(app).post('/api/inquiries').send({ ...validInquiry, website: 'http://spam.example' }).expect(201);
    await request(app).post('/api/inquiries').send({ ...validInquiry, elapsedMs: 300 }).expect(201);
    const after = (await agent.get('/api/admin/inquiries')).body.total;
    expect(after).toBe(before);
  });

  it('requires a JSON body', async () => {
    await request(app).post('/api/inquiries').type('form').send('fullName=x').expect(415);
  });

  it('stores markup as inert text', async () => {
    await request(app).post('/api/inquiries').send({ ...validInquiry, companyName: '<img src=x onerror=alert(1)>' }).expect(201);
    const { agent } = await signIn(app);
    const list = await agent.get('/api/admin/inquiries?q=onerror').expect(200);
    expect(list.body.items[0].companyName).toBe('<img src=x onerror=alert(1)>');
    expect(list.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('SEO endpoints', () => {
  it('publishes a sitemap with every published product', async () => {
    const res = await request(app).get('/sitemap.xml').expect(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    for (const slug of ['hips', 'abs', 'hdpe', 'polystyrene-granules']) expect(res.text).toContain(`/products/${slug}</loc>`);
    expect(res.text).toContain('/request-quote</loc>');
  });

  it('keeps crawlers out of the dashboard and API', async () => {
    const res = await request(app).get('/robots.txt').expect(200);
    expect(res.text).toContain('Disallow: /admin');
    expect(res.text).toContain('Disallow: /api/');
    expect(res.text).toContain('Sitemap: ');
  });

  it('renders per-page meta tags and structured data', async () => {
    const { renderIndexHtml } = await import('../src/services/seo');
    const template = '<html><head><title>x</title><!--app-head--></head><body></body></html>';
    const product = await renderIndexHtml(template, '/products/hips');
    expect(product.status).toBe(200);
    expect(product.html).toContain('<title>HIPS — High Impact Polystyrene | Arizen Polymers</title>');
    expect(product.html).toContain('"@type":"Product"');
    expect(product.html).toContain('"@type":"BreadcrumbList"');
    expect(product.html).toMatch(/<link rel="canonical" href="[^"]+\/products\/hips"/);
    const missing = await renderIndexHtml(template, '/products/nope');
    expect(missing.status).toBe(404);
    expect(missing.html).toContain('noindex');
    const admin = await renderIndexHtml(template, '/admin/products');
    expect(admin.html).toContain('noindex, nofollow');
  });

  it('escapes editor-supplied text in the document head', async () => {
    const { agent, csrf } = await signIn(app);
    const products = (await agent.get('/api/admin/products')).body;
    const abs = (await agent.get(`/api/admin/products/${products.find((p: { code: string }) => p.code === 'ABS')._id}`)).body;
    const { _id, __v, createdAt, updatedAt, ...input } = abs;
    void __v;
    void createdAt;
    void updatedAt;
    input.seo.title = '</title><script>alert(1)</script>';
    input.summary = '</script><script>alert(2)</script>';
    input.category = String(input.category);
    await agent.put(`/api/admin/products/${_id}`).set('x-csrf-token', csrf).send(input).expect(200);
    const { renderIndexHtml } = await import('../src/services/seo');
    const out = await renderIndexHtml('<head><title>x</title><!--app-head--></head><body></body>', '/products/abs');
    expect(out.html).not.toContain('<script>alert');
    expect(out.html).toContain('&lt;/title&gt;');
    // The embedded page data must not be able to close its <script> element.
    const embedded = /<script type="application\/json" id="__ARIZEN_DATA__">([\s\S]*?)<\/script>/.exec(out.html);
    expect(embedded).not.toBeNull();
    expect(embedded![1]).not.toContain('</');
    expect(JSON.parse(embedded![1])['/api/products/abs'].summary).toBe('</script><script>alert(2)</script>');
  });

  it('sends security headers', async () => {
    const res = await request(app).get('/api/site');
    expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
