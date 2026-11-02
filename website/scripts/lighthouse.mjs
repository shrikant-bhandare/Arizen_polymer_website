/**
 * Lighthouse audit of key pages (mobile and desktop) against a running build.
 *
 *   npm run build && npm start          # or any running instance
 *   LH_URL=http://localhost:4000 npm run lighthouse
 *
 * Edge or Chrome is launched through Playwright with a fixed debugging port,
 * which works on Windows where Lighthouse's own launcher may not.
 */
import lighthouse from 'lighthouse';
import { chromium } from 'playwright-core';

const BASE = (process.env.LH_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PAGES = ['/', '/products/hips', '/contact'];
const PORT = 9333;

async function launch() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel, args: [`--remote-debugging-port=${PORT}`] });
    } catch {
      /* next */
    }
  }
  throw new Error('Edge or Chrome is required.');
}

const rows = [];
for (const formFactor of ['mobile', 'desktop']) {
  for (const page of PAGES) {
    const config = formFactor === 'desktop' ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
    // Trace processing is occasionally flaky with very new browsers: retry with a fresh browser.
    let lhr;
    for (let attempt = 1; attempt <= 3 && (!lhr || lhr.runtimeError); attempt++) {
      const browser = await launch();
      try {
        ({ lhr } = await lighthouse(BASE + page, { port: PORT, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, config));
      } finally {
        await browser.close();
      }
    }
    if (lhr.runtimeError) {
      rows.push({ page, formFactor, perf: 'error', a11y: '', bp: '', seo: '', LCP: lhr.runtimeError.code, CLS: '', TBT: '', problems: '' });
      continue;
    }
    {
      const score = (k) => Math.round(lhr.categories[k].score * 100);
      const problems = Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 0.9 && ['binary', 'numeric'].includes(a.scoreDisplayMode) && a.id !== 'bf-cache')
        .map((a) => a.id);
      rows.push({ page, formFactor, perf: score('performance'), a11y: score('accessibility'), bp: score('best-practices'), seo: score('seo'), LCP: lhr.audits['largest-contentful-paint'].displayValue, CLS: lhr.audits['cumulative-layout-shift'].displayValue, TBT: lhr.audits['total-blocking-time'].displayValue, problems: problems.join(' ') });
    }
  }
}
console.table(rows.map(({ problems: _p, ...r }) => r));
for (const r of rows) if (r.problems) console.log(`${r.formFactor} ${r.page}: ${r.problems}`);
