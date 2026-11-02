# Arizen Polymers — Interactive Website Proposal

An interactive, animated proposal for **Arizen Polymers India Private Limited**, prepared by **Neureonix**
(Proposal NP/2026-27/001, 02 November 2026), with a matching print-ready A4 PDF.

Built with React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion and Lucide icons.

## Deliverables

| File | What it is |
|---|---|
| `dist/index.html` | The complete proposal in **one self-contained file** (scripts, styles, fonts and images inlined). Open it by double-clicking, email it, or upload it anywhere. |
| `dist/Arizen-Polymers-Website-Proposal-NP-2026-27-001.pdf` | Print-ready A4 PDF (9 pages) generated from the dedicated print layout. |

When the PDF sits next to `index.html` on a web server, the **Download PDF** button downloads it.
When the page is opened from disk (or no PDF is hosted), the button opens the print dialog, which uses
the same print layout, so *Save as PDF* produces the identical document.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build and export

```bash
npm run release      # type-check + build dist/index.html, then render the PDF
```

Or separately:

```bash
npm run build        # dist/index.html
npm run pdf          # dist/…pdf (also copied to public/ so later builds include it)
```

PDF export and the checks drive the installed **Microsoft Edge** (or Google Chrome) through
`playwright-core`. No browser download is needed.

## Deploy

Upload the contents of `dist/` (both files) to any static host: Netlify, Vercel, Cloudflare Pages,
S3, or a plain web server. No server-side code is required. The page is marked `noindex` so search
engines will not list a confidential proposal.

## Verify

```bash
npm run dev          # keep running
npm run check        # in a second terminal
```

`scripts/check.mjs` runs in headless Edge and verifies:

- no horizontal overflow and no distorted images at 1920, 1440, 1024, 768, 390 and 360 px;
- no console errors, page errors or failed requests;
- every interaction: Explore Proposal, nav links and active indicator, compact nav, product cards,
  scope expand/collapse, architecture diagram, timeline stages, index overlay (incl. Escape),
  mobile menu, Contact, back to top, Download PDF;
- all commercial figures are present, the six cost lines sum to ₹85,000, and the four milestones are
  exactly 40/30/20/10 % of ₹85,000;
- with reduced motion, every figure shows its final value and no content stays hidden.

Full-page screenshots are written to `check-output/`.

## Editing content

**All words and figures live in [`src/content/proposal.ts`](src/content/proposal.ts).** The interactive
page and the PDF both read from it. Totals (₹85,000, the ₹27,000–₹31,500 annual range) are computed
from the line items, so they cannot drift apart.

Before sending, fill in:

- **`contact`**: Neureonix contact person, email, phone and website. Until set, these show as clearly
  marked "To be added" placeholders.
- **`portfolio.items`**: real project references (title, URL, optional screenshot). While empty, the
  section reads "Portfolio References Available Upon Request."

## Product imagery

No product photographs were supplied, so the four product visuals are **procedural material renders**
(`scripts/render-materials.py`): opaque white HIPS, ivory ABS, translucent HDPE and clear
polystyrene granules. The page labels them as illustrative. To use official photography, replace the
files in `src/assets/materials/` (keep the names, 4:3 ratio, about 1200×900; the `-print.jpg` copies are
used in the PDF). To re-render: `pip install numpy pillow && python scripts/render-materials.py`.

## Project structure

```
src/
  content/proposal.ts     all copy and figures
  sections/               the 15 proposal sections (Hero … Closing)
  components/             Nav, Reveal, SplitText, CountUp, ParticleField, Molecule, …
  print/PrintProposal.tsx static A4 print/PDF layout (no animation)
  lib/                    formatting, section registry, hooks, PDF action
  index.css               design tokens, fonts, print rules (@page, page numbers)
scripts/
  render-materials.py     product imagery renderer
  export-pdf.mjs          PDF export
  check.mjs               end-to-end checks
```

## Accessibility and performance

- Honours `prefers-reduced-motion`: no particle animation, no movement, and final values from the start.
- Semantic landmarks and headings, a skip link, labelled controls, `aria-expanded`/`aria-pressed`
  state, a focus-trapped index dialog, and visible focus rings.
- The particle canvas pauses off-screen and in background tabs and caps the device pixel ratio.
  Images are lazy-loaded with fixed dimensions (no layout shift), and fonts are subset and bundled.

Fonts: Manrope and Inter (SIL Open Font License; see `src/assets/fonts/`).
