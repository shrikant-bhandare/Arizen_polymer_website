/**
 * Browser end-to-end checks for the Arizen Polymers website and CMS (headless Edge or Chrome).
 *
 *   npm run dev                     # API + website, with a seeded database
 *   npm run e2e                     # in a second terminal
 *   E2E_URL=http://localhost:4000 npm run e2e   # against the production build
 *
 * Admin credentials are read from server/.env (ADMIN_EMAIL / ADMIN_PASSWORD).
 * Changes made during the run are reverted at the end.
 * Screenshots are written to ./e2e-output.
 */
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';

const sharp = createRequire(new URL('../server/package.json', import.meta.url))('sharp');

const BASE = (process.env.E2E_URL ?? 'http://localhost:5174').replace(/\/$/, '');
const OUT = new URL('../e2e-output/', import.meta.url);
const WIDTHS = [1920, 1440, 1024, 768, 390, 360];
const PAGES = ['/', '/about', '/products', '/products/hips', '/products/abs', '/products/hdpe', '/products/polystyrene-granules', '/infrastructure', '/quality', '/contact', '/request-quote?product=hdpe', '/this-page-does-not-exist'];

const env = Object.fromEntries(
  readFileSync(new URL('../server/.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const ADMIN = { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD };

const failures = [];
/* Saves are confirmed by the API response rather than toast text, since toasts can stack. */
const fail = (m) => {
  failures.push(m);
  console.log(`  ✗ ${m}`);
};
const pass = (m) => console.log(`  ✓ ${m}`);
const check = (ok, m, detail = '') => (ok ? pass(m) : fail(`${m}${detail ? ` — ${detail}` : ''}`));
const path = (name) => new URL(name, OUT).pathname.replace(/^\/([A-Z]:)/, '$1');

async function launch() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* try the next browser */
    }
  }
  throw new Error('Microsoft Edge or Google Chrome is required.');
}

function watch(page, label) {
  page.on('pageerror', (e) => fail(`[${label}] page error: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Expected: the 404 page's API lookup, and the deliberate wrong-password attempt.
    if (/status of 401/.test(t) && page.url().includes('/admin/login')) return;
    if (/status of 404/.test(t) && page.url().includes('does-not-exist')) return;
    fail(`[${label}] console error: ${t}`);
  });
  page.on('response', (r) => {
    const url = r.url();
    if (r.status() >= 500) fail(`[${label}] HTTP ${r.status()} ${url}`);
    if (r.status() === 404 && !url.includes('does-not-exist') && !url.includes('/products/e2e-') && !url.endsWith('/favicon.ico')) fail(`[${label}] HTTP 404 ${url}`);
  });
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.6)) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1600);
}

const overflow = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || r.right <= vw + 1) continue;
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o !== 'visible') {
        clipped = true;
        break;
      }
    }
    if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`);
  }
  return { scroll: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 5) };
};

async function responsive(browser) {
  for (const width of WIDTHS) {
    console.log(`\nResponsive ${width}px`);
    const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 820 : 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    watch(page, `${width}px`);
    let clean = true;
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      const o = await page.evaluate(overflow);
      if (o.scroll > o.vw || o.bad.length) {
        clean = false;
        fail(`${width}px ${p}: horizontal overflow (${o.scroll}/${o.vw}) ${o.bad.join(', ')}`);
      }
      if ([1440, 390].includes(width) && ['/', '/products/hips', '/contact', '/about'].includes(p)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path(`${width}${p.replace(/[/?=]/g, '_') || '_home'}.png`), fullPage: true });
      }
    }
    if (clean) pass(`all ${PAGES.length} pages fit without horizontal scrolling`);
    await ctx.close();
  }
}

async function visitorJourney(browser) {
  console.log('\nVisitor journey (1440px, full motion)');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, 'journey');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  check((await page.title()).includes('Arizen'), 'homepage has a title');
  check(await page.locator('h1').first().isVisible(), 'hero headline is visible');
  const video = await page.locator('video').count();
  check(video === 1, 'hero video is present for motion-enabled visitors');

  // Products dropdown
  await page.locator('header nav').getByRole('link', { name: 'Products', exact: true }).hover();
  await page.waitForTimeout(600);
  check((await page.locator('#products-menu a[href^="/products/"]').count()) === 4, 'products dropdown lists the four products');
  await page.mouse.move(700, 600);

  await page.getByRole('link', { name: /Explore Products/ }).click();
  await page.waitForURL('**/products');
  check(true, 'Explore Products opens the catalogue');

  // Category filter
  await page.getByRole('link', { name: 'Polyolefins' }).click();
  await page.waitForTimeout(900);
  const shown = await page.locator('main ul > li a[href^="/products/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check(shown.length === 1 && shown[0] === '/products/hdpe', 'category filter shows only HDPE under Polyolefins', JSON.stringify(shown));

  await page.locator('a[href="/products/hdpe"]').first().click();
  await page.waitForURL('**/products/hdpe');
  await page.waitForTimeout(800);
  check(await page.getByRole('heading', { name: /Technical specifications/ }).isVisible(), 'product page shows the specifications section');
  check(await page.getByText('Typical applications').isVisible(), 'product page shows applications');
  check((await page.locator('a[href^="/products/"]').filter({ hasText: 'View product' }).count()) >= 3, 'product page shows related products');

  await page.getByRole('link', { name: 'Request a Quote' }).nth(1).click();
  await page.waitForURL('**/request-quote?product=hdpe');
  check((await page.locator('#inq-product').inputValue()) === 'hdpe', 'quote form arrives with HDPE pre-selected');

  // Validation feedback
  await page.getByRole('button', { name: /Submit inquiry/ }).click();
  await page.waitForTimeout(400);
  check((await page.locator('[id^="inq-"][id$="-error"]').count()) >= 5, 'empty submission shows field errors');
  await page.fill('#inq-email', 'not-an-email');
  await page.locator('#inq-email').blur();
  check(await page.getByText('Please enter a valid business email').isVisible(), 'invalid email is explained');

  await page.fill('#inq-fullName', 'E2E Test Buyer');
  await page.fill('#inq-companyName', 'E2E Moulding Works');
  await page.fill('#inq-email', 'e2e.buyer@example.com');
  await page.fill('#inq-phone', '+91 98765 43210');
  await page.fill('#inq-quantity', '10 MT');
  await page.fill('#inq-message', 'Automated end-to-end test inquiry. Please ignore.');
  await page.waitForTimeout(2600); // the spam guard rejects instant submissions
  await page.getByRole('button', { name: /Submit inquiry/ }).click();
  await page.getByText('Your inquiry has been received').waitFor({ timeout: 8000 });
  const ref = (await page.locator('p.tabular').filter({ hasText: /^[A-F0-9]{6}$/ }).first().textContent())?.trim();
  check(/^[A-F0-9]{6}$/.test(ref ?? ''), `inquiry submitted with reference ${ref}`);
  await ctx.close();
  return ref;
}

async function mobile(browser) {
  console.log('\nMobile navigation (390px)');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'mobile');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open menu' }).tap();
  await page.waitForTimeout(700);
  check(await page.getByRole('dialog', { name: 'Menu' }).isVisible(), 'mobile menu opens');
  await page.getByRole('dialog').getByRole('link', { name: 'Quality', exact: true }).tap();
  await page.waitForURL('**/quality');
  await page.waitForTimeout(1200);
  check((await page.getByRole('dialog').count()) === 0, 'mobile menu closes after navigating');
  await page.goto(BASE + '/this-page-does-not-exist', { waitUntil: 'networkidle' });
  check(await page.getByText('This page could not be found.').isVisible(), 'unknown URLs show the 404 page');
  await ctx.close();
}

async function admin(browser, reference) {
  console.log('\nCMS dashboard (1440px)');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, 'admin');
  page.on('dialog', (d) => d.accept());

  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  check(page.url().includes('/admin/login'), 'dashboard redirects to sign-in when signed out');
  await page.fill('#email', ADMIN.email);
  await page.fill('#password', 'definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Incorrect email or password.').waitFor({ timeout: 5000 });
  pass('wrong password is rejected with a clear message');
  await page.fill('#password', ADMIN.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL((u) => u.pathname === '/admin');
  await page.getByText('New inquiries').waitFor();
  pass('administrator signs in and sees the dashboard');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path('admin-dashboard.png'), fullPage: true });

  // Inquiry management
  await page.getByRole('link', { name: 'Inquiries' }).first().click();
  await page.fill('input[placeholder^="Search"]', 'E2E Moulding');
  await page.waitForTimeout(900);
  await page.getByRole('link', { name: 'E2E Moulding Works' }).first().click();
  await page.waitForTimeout(600);
  check(await page.getByText(`Ref. ${reference}`).isVisible(), 'submitted inquiry is in the dashboard with its reference');
  await page.selectOption('#status', 'contacted');
  await page.getByText('Status updated to Contacted.').waitFor();
  await page.fill('#note', 'E2E note: called the buyer.');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByText('E2E note: called the buyer.').waitFor();
  check(await page.getByText(/Status changed from New to Contacted/).isVisible(), 'status change and note are recorded in the activity log');
  await page.screenshot({ path: path('admin-inquiry.png'), fullPage: true });

  // Product create → publish → public → delete
  await page.goto(BASE + '/admin/products/new', { waitUntil: 'networkidle' });
  await page.getByLabel('Product name').fill('E2E Test Polymer');
  await page.getByLabel('Code').fill('E2E');
  check((await page.getByLabel('URL slug').inputValue()) === 'e2e-test-polymer', 'slug is generated from the name');
  await page.getByLabel('Summary').fill('Temporary product created by the automated test.');
  await page.getByRole('button', { name: 'Add specification' }).click();
  await page.getByLabel('Row 1 property').fill('Density');
  await page.getByLabel('Row 1 value').fill('1.05');
  await page.getByLabel('Row 1 unit').fill('g/cm³');
  await page.getByRole('switch', { name: 'Draft' }).click();
  await page.screenshot({ path: path('admin-product-editor.png'), fullPage: true });
  await page.getByRole('button', { name: 'Create product' }).click();
  await page.getByText('Product created.').waitFor();
  pass('product created and published from the editor');

  const pub = await ctx.newPage();
  await pub.goto(BASE + '/products/e2e-test-polymer', { waitUntil: 'networkidle' });
  check(await pub.getByRole('cell', { name: '1.05' }).isVisible(), 'new product page is live with its specification table');
  await pub.close();

  await page.goto(BASE + '/admin/products', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Delete E2E Test Polymer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await page.getByText('E2E Test Polymer deleted.').waitFor();
  pass('product deleted');

  // Content editing reflected on the public site
  await page.goto(BASE + '/admin/content/home', { waitUntil: 'networkidle' });
  const supporting = page.getByLabel('Supporting text').first();
  await page.screenshot({ path: path('admin-content.png') });
  const original = await supporting.inputValue();
  await supporting.fill('E2E check: supporting text updated.');
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/admin/content/home') && r.request().method() === 'PUT' && r.ok()),
    page.getByRole('button', { name: 'Save changes' }).first().click(),
  ]);
  const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const home = await fresh.newPage();
  await home.goto(BASE + '/', { waitUntil: 'networkidle' });
  check(await home.getByText('E2E check: supporting text updated.').isVisible(), 'homepage edit appears on the public site');
  await fresh.close();
  await supporting.fill(original);
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/admin/content/home') && r.request().method() === 'PUT' && r.ok()),
    page.getByRole('button', { name: 'Save changes' }).first().click(),
  ]);

  // Unsafe link rejected in the editor
  await page.getByLabel('Link').first().fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save changes' }).first().click();
  check(await page.getByText(/Use a path such as \/products/).first().isVisible(), 'unsafe javascript: links are rejected with an explanation');
  await page.reload({ waitUntil: 'networkidle' });

  // Media upload
  await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle' });
  const png = await sharp({ create: { width: 800, height: 600, channels: 3, background: '#47C5D3' } }).png().toBuffer();
  await page.locator('input[type=file]').setInputFiles({ name: 'e2e-upload.png', mimeType: 'image/png', buffer: png });
  await page.getByText('e2e-upload.png uploaded.').waitFor({ timeout: 20000 });
  await page.getByLabel('Alt text').fill('E2E test image');
  await page.screenshot({ path: path('admin-media.png') });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByText('Image details saved.').waitFor();
  await page.getByRole('button', { name: 'Delete image' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await page.getByText('Image deleted.').waitFor();
  pass('image uploaded, described and deleted in the media library');
  await page.locator('input[type=file]').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  check(await page.getByText(/only JPEG, PNG, WebP and AVIF/).isVisible(), 'non-image uploads are refused with a clear message');

  // Clean up the test inquiry, then sign out
  await page.goto(BASE + '/admin/inquiries?q=E2E%20Moulding', { waitUntil: 'networkidle' });
  for (let i = 0; i < 5 && (await page.getByRole('link', { name: 'E2E Moulding Works' }).count()); i++) {
    await page.getByRole('link', { name: 'E2E Moulding Works' }).first().click();
    await page.getByRole('button', { name: 'Delete inquiry' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await page.waitForURL('**/admin/inquiries');
    await page.goto(BASE + '/admin/inquiries?q=E2E%20Moulding', { waitUntil: 'networkidle' });
  }
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/admin/login');
  await page.goto(BASE + '/admin/inquiries', { waitUntil: 'networkidle' });
  check(page.url().includes('/admin/login'), 'after signing out the dashboard requires sign-in again');
  await page.screenshot({ path: path('admin-login.png') });
  await ctx.close();
}

await mkdir(OUT, { recursive: true });
const browser = await launch();
try {
  const reference = await visitorJourney(browser);
  await mobile(browser);
  await admin(browser, reference);
  await responsive(browser);
} catch (err) {
  fail(`run aborted: ${err.message.split('\n')[0]}`);
} finally {
  await browser.close();
}
console.log(failures.length ? `\n${failures.length} problem(s) found.` : '\nAll end-to-end checks passed.');
process.exit(failures.length ? 1 : 0);
