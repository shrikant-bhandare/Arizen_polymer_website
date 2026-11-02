/**
 * End-to-end checks for the proposal, run in headless Microsoft Edge (or Chrome).
 *
 *   npm run dev            # in another terminal, or set PROPOSAL_URL
 *   npm run check
 *
 * Verifies, at every target width: no horizontal overflow, no console or page
 * errors, no failed requests, all interactions working, all commercial figures
 * present and internally consistent, and content visible with reduced motion.
 * Full-page screenshots are written to ./check-output for visual review.
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const URL = process.env.PROPOSAL_URL ?? 'http://localhost:5173/';
const OUT = new globalThis.URL('../check-output/', import.meta.url);
const WIDTHS = [1920, 1440, 1024, 768, 390, 360];

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function launch() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel });
    } catch {
      // try the next installed browser
    }
  }
  throw new Error('Neither Microsoft Edge nor Google Chrome could be launched.');
}

function watch(page, label) {
  page.on('console', (m) => {
    // Framer Motion's development-only notice when the OS asks for reduced motion is expected here.
    if (m.text().includes('You have Reduced Motion enabled')) return;
    if (m.type() === 'error' || m.type() === 'warning') fail(`[${label}] console ${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => fail(`[${label}] page error: ${e.message}`));
  page.on('requestfailed', (r) => {
    // Chromium reports a request that becomes a file download as aborted; the download itself is checked separately.
    if (r.url().endsWith('.pdf') && r.failure()?.errorText === 'net::ERR_ABORTED') return;
    fail(`[${label}] request failed: ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) fail(`[${label}] HTTP ${r.status()}: ${r.url()}`);
  });
}

/** Scroll the whole page slowly so every in-view animation runs. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
  });
  await page.waitForTimeout(2600);
}

const overflowScript = () => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('main *, header *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    // Elements inside a clipping ancestor (decorative art, masks) cannot cause page scroll.
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'hidden' || o === 'clip' || o === 'auto') {
        clipped = true;
        break;
      }
    }
    if (!clipped && r.right > vw + 1) offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(r.right)}px`);
  }
  return { scrollWidth: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 8) };
};

async function checkWidth(browser, width) {
  console.log(`\n${width}px`);
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  watch(page, `${width}px`);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await scrollThrough(page);

  const o = await page.evaluate(overflowScript);
  if (o.scrollWidth > o.vw) fail(`${width}px: horizontal overflow (${o.scrollWidth} > ${o.vw}) ${o.offenders.join('; ')}`);
  else pass('no horizontal overflow');
  if (o.offenders.length) fail(`${width}px: elements past the right edge: ${o.offenders.join('; ')}`);

  // Images must not be distorted: rendered aspect should match intrinsic aspect (object-cover crops, never stretches).
  const distorted = await page.evaluate(() =>
    [...document.querySelectorAll('main img')].filter((img) => img.naturalWidth && getComputedStyle(img).objectFit !== 'cover' && Math.abs(img.width / img.height - img.naturalWidth / img.naturalHeight) > 0.02).length,
  );
  if (distorted) fail(`${width}px: ${distorted} distorted image(s)`);
  else pass('images keep their proportions');

  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: new globalThis.URL(`page-${width}.png`, OUT).pathname.replace(/^\/([A-Z]:)/, '$1'), fullPage: true });
  await context.close();
}

async function checkInteractions(browser) {
  console.log('\nInteractions (1440px)');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watch(page, 'interactions');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Explore Proposal → introduction
  await page.getByRole('button', { name: 'Explore Proposal' }).click();
  await page.waitForTimeout(1500);
  const introTop = await page.evaluate(() => document.getElementById('introduction').getBoundingClientRect().top);
  Math.abs(introTop) < 120 ? pass('Explore Proposal scrolls to the introduction') : fail(`Explore Proposal: introduction top at ${introTop}`);

  // Sticky nav compacts and highlights the active section
  const navHeight = await page.evaluate(() => document.querySelector('header nav').getBoundingClientRect().height);
  navHeight <= 60 ? pass(`navigation compacts on scroll (${navHeight}px)`) : fail(`navigation did not compact (${navHeight}px)`);
  for (const [label, id] of [
    ['Investment', 'investment'],
    ['Timeline', 'timeline'],
    ['Products', 'products'],
  ]) {
    await page.locator('header nav ul').getByRole('link', { name: label }).click();
    await page.waitForTimeout(1800);
    const state = await page.evaluate((target) => ({
      top: document.getElementById(target).getBoundingClientRect().top,
      current: document.querySelector('header nav a[aria-current="location"]')?.textContent?.trim(),
    }), id);
    Math.abs(state.top) < 120 && state.current === label ? pass(`nav link "${label}" scrolls and becomes active`) : fail(`nav link "${label}": top ${state.top}, active "${state.current}"`);
  }

  // Product card toggle
  const toggle = page.locator('#products article').first().getByRole('button', { name: 'On the website' });
  await toggle.click();
  await page.waitForTimeout(700);
  (await toggle.getAttribute('aria-expanded')) === 'true' && (await page.locator('#products article').first().getByText('Direct product inquiry').isVisible())
    ? pass('product card expands its details')
    : fail('product card did not expand');

  // Scope: expand all / collapse all / single toggle
  await page.locator('#scope').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Expand all details' }).click();
  await page.waitForTimeout(900);
  const expanded = await page.locator('#scope ol > li button[aria-expanded="true"]').count();
  expanded === 7 ? pass('scope "Expand all" opens all 7 areas') : fail(`scope expand all opened ${expanded}`);
  (await page.locator('#scope').getByText('SEO metadata management').isVisible()) ? pass('scope details are visible when expanded') : fail('scope detail not visible');
  await page.getByRole('button', { name: 'Collapse all details' }).click();
  await page.waitForTimeout(900);
  const afterCollapse = await page.locator('#scope ol > li button[aria-expanded="true"]').count();
  afterCollapse === 0 ? pass('scope "Collapse all" closes every area') : fail(`scope collapse left ${afterCollapse} open`);

  // Digital foundation layer selection
  await page.locator('#foundation').scrollIntoViewIfNeeded();
  await page.locator('#foundation figure').getByRole('button', { name: 'Inquiry processing' }).click();
  await page.waitForTimeout(600);
  (await page.locator('#foundation [aria-live]').innerText()).includes('spam-protected') ? pass('architecture diagram selection updates the description') : fail('architecture selection did not update');

  // Timeline stage selection
  await page.locator('#timeline').scrollIntoViewIfNeeded();
  await page.locator('#timeline').getByRole('button', { name: /Backend & CMS Development/ }).first().click();
  await page.waitForTimeout(600);
  /stage 03/i.test(await page.locator('#timeline [aria-live]').innerText()) ? pass('timeline stage selection shows its detail') : fail('timeline selection did not update');

  // Index overlay: open, keyboard escape, navigate
  await page.getByRole('button', { name: /Index/ }).click();
  await page.waitForTimeout(800);
  (await page.getByRole('dialog', { name: 'Proposal index' }).isVisible()) ? pass('index overlay opens') : fail('index overlay did not open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  (await page.getByRole('dialog').count()) === 0 ? pass('Escape closes the index overlay') : fail('Escape did not close overlay');
  await page.getByRole('button', { name: /Index/ }).click();
  await page.waitForTimeout(800);
  await page.getByRole('dialog').getByRole('link', { name: /Terms & Conditions/ }).click();
  await page.waitForTimeout(1800);
  const termsTop = await page.evaluate(() => document.getElementById('terms').getBoundingClientRect().top);
  Math.abs(termsTop) < 120 ? pass('index overlay link navigates to its section') : fail(`index link: terms top ${termsTop}`);

  // Contact button → acceptance
  await page.getByRole('link', { name: 'Contact' }).click();
  await page.waitForTimeout(1800);
  const accTop = await page.evaluate(() => document.getElementById('acceptance').getBoundingClientRect().top);
  Math.abs(accTop) < 120 ? pass('Contact navigates to contact & acceptance') : fail(`contact: acceptance top ${accTop}`);

  // Back to top
  await page.getByRole('button', { name: 'Back to top' }).first().click();
  await page.waitForTimeout(2200);
  const y = await page.evaluate(() => scrollY);
  y < 20 ? pass('back-to-top returns to the opening') : fail(`back to top left scrollY=${y}`);

  // Download PDF serves the hosted PDF, or falls back to the print layout when none is deployed.
  await page.evaluate(() => {
    window.__printed = 0;
    window.print = () => (window.__printed += 1);
  });
  const download = page.waitForEvent('download', { timeout: 4000 }).catch(() => null);
  await page.locator('header').getByRole('button', { name: 'Download PDF' }).click();
  const file = await download;
  const printed = await page.evaluate(() => window.__printed);
  if (file) pass(`Download PDF downloads ${file.suggestedFilename()}`);
  else if (printed === 1) pass('Download PDF opens the print layout (no hosted PDF found)');
  else fail('Download PDF did nothing');

  await context.close();
}

async function checkMobileMenu(browser) {
  console.log('\nMobile menu (390px)');
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  watch(page, 'mobile');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Open proposal index' }).tap();
  await page.waitForTimeout(900);
  await page.getByRole('dialog').getByRole('link', { name: /Payment Milestones/ }).tap();
  await page.waitForTimeout(2000);
  const top = await page.evaluate(() => document.getElementById('payments').getBoundingClientRect().top);
  Math.abs(top) < 120 ? pass('mobile menu opens and navigates') : fail(`mobile menu: payments top ${top}`);
  await context.close();
}

async function checkFigures(browser) {
  console.log('\nCommercial figures');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  watch(page, 'figures');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await scrollThrough(page);
  const text = await page.locator('main').innerText();

  const required = [
    '₹85,000',
    '₹15,000', '₹20,000', '₹22,000', '₹12,000', '₹8,000',
    '₹34,000', '₹25,500', '₹17,000', '₹8,500',
    '5–7 Days', '7–8 Days', '5–6 Days', '3–4 Days',
    '₹1,000–₹1,500', '₹8,000–₹12,000', 'Free (Let’s Encrypt)', '₹18,000', '₹27,000–₹31,500',
    'NP/2026-27/001', '02 November 2026', 'GST: Additional as applicable.',
    'Quotation validity: 15 days',
    'Portfolio References Available Upon Request.',
  ];
  const missing = required.filter((s) => !text.includes(s));
  const duration = (await page.locator('#timeline').innerText()).replace(/\s+/g, ' ');
  if (!/25–33 working days/i.test(duration)) missing.push('25–33 working days');
  missing.length ? fail(`missing on page: ${missing.join(', ')}`) : pass(`all ${required.length} required figures and facts are on the page`);

  const lines = await page.$$eval('#investment tbody tr td:last-child', (tds) => tds.map((td) => Number(td.textContent.replace(/[^\d]/g, ''))));
  const sum = lines.reduce((a, b) => a + b, 0);
  lines.length === 6 && sum === 85000 ? pass(`cost breakdown: 6 lines sum to ₹${sum.toLocaleString('en-IN')}`) : fail(`cost lines ${lines} sum ${sum}`);

  const ms = await page.$$eval('#payments ol > li', (lis) => lis.map((li) => li.innerText));
  const pct = ms.map((t) => Number(/(\d+)%/.exec(t)[1]));
  const amt = ms.map((t) => Number(/₹([\d,]+)/.exec(t)[1].replace(/,/g, '')));
  const ok = pct.reduce((a, b) => a + b, 0) === 100 && amt.reduce((a, b) => a + b, 0) === 85000 && pct.every((p, i) => (p / 100) * 85000 === amt[i]);
  ok ? pass(`payments: ${pct.join('/')}% = ₹${amt.map((a) => a.toLocaleString('en-IN')).join(' + ')} = ₹85,000`) : fail(`payments inconsistent: ${pct} ${amt}`);

  // Reduced motion: count-ups land on their final values and every revealed element is fully visible.
  const big = await page.locator('#investment p.display').innerText();
  big.includes('₹85,000') ? pass('reduced motion: total shows final value') : fail(`reduced motion: total shows "${big}"`);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('main [style*="opacity"]')].filter((e) => getComputedStyle(e).opacity === '0' && !e.closest('[aria-hidden="true"]')).length);
  hidden === 0 ? pass('reduced motion: no content left invisible') : fail(`reduced motion: ${hidden} elements still invisible`);

  const external = await page.$$eval('a[href^="http"]', (as) => as.map((a) => a.href));
  external.length === 0 ? pass('no external links to verify (contact and portfolio are placeholders)') : console.log(`  • external links to check manually: ${external.join(', ')}`);
  await context.close();
}

await mkdir(OUT, { recursive: true });
const browser = await launch();
try {
  for (const w of WIDTHS) await checkWidth(browser, w);
  await checkInteractions(browser);
  await checkMobileMenu(browser);
  await checkFigures(browser);
} finally {
  await browser.close();
}

console.log(failures.length ? `\n${failures.length} problem(s) found.` : '\nAll checks passed.');
process.exit(failures.length ? 1 : 0);
