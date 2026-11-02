# Arizen Polymers — corporate website & CMS

Production-ready corporate website for **Arizen Polymers India Private Limited** with a full content
management dashboard, built by **Neureonix**.

*"Materials that move industries."* A cinematic, premium industrial brand site with a dynamic
product catalogue, a B2B quote-request journey, and an admin CMS that lets the Arizen team run the
website without a developer.

## What's included

| Area | Highlights |
|---|---|
| **Public website** | Home (cinematic video hero), About, Products, 4 dynamic product pages (`/products/hips`, `/abs`, `/hdpe`, `/polystyrene-granules`), Infrastructure, Quality Control, Contact (Google Maps), Request a Quote, 404 |
| **B2B inquiry journey** | Product → specs → *Request a Quote* (product pre-selected) → validated form → success reference; honeypot + timing spam guard, rate limit, stored in MongoDB, email notification |
| **CMS dashboard** (`/admin`) | Dashboard totals & recent activity · Products (specs, grades, applications, gallery, related, SEO, publish) · Categories (order) · Pages (every page, navigation & footer; forms generated from one schema) · Inquiries (search, filters, status workflow, notes, CSV export) · Media library (WebP/AVIF conversion, usage check) · Settings (contact, logo, SEO defaults, notifications) · Users (roles) |
| **SEO** | Server-rendered per-page title/description/canonical/Open Graph, JSON-LD (Organization, WebSite, BreadcrumbList, Product), `sitemap.xml`, `robots.txt`, real 404 status |
| **Performance** | Route code-splitting, admin never shipped to visitors, page data embedded in the HTML, LCP preload, route `modulepreload`, responsive AVIF/WebP, lazy media, immutable asset caching |
| **Security** | bcrypt, httpOnly SameSite=Strict session + double-submit CSRF, roles, Zod validation everywhere, NoSQL-injection guard, strict CSP & security headers, rate limits, re-encoded uploads, CSV formula-injection guard, no secrets in the client |
| **Motion** | Framer Motion + SVG: masked headline reveals, molecule drawing, image clip reveals, parallax, staggered sections, micro-interactions. Honours *reduced motion* (video replaced by poster) |

**Lighthouse** (production build, local): accessibility, best practices and SEO **100** on every audited
page; performance **99–100 desktop**, **78–88 mobile** (simulated slow 4G). See *Verification*.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · React Router 7 · React Hook Form · Zod · Lucide —
Node.js · Express 5 · MongoDB 8 · Mongoose 9 · sharp · nodemailer · pino.

```
website/
  client/          React app: public site (src/pages) and CMS (src/admin)
  server/          Express API, HTML shell with SEO, uploads, seed & admin scripts, tests
  shared/          Zod schemas and the CMS field descriptors used by both sides
  deploy/          Production Docker Compose, Nginx, PM2, backup script
  docs/            Deployment, admin guide, client content checklist, visual production (Google Flow)
  scripts/         e2e tests, Lighthouse, asset generators (renders, hero video, illustrations, OG image)
```

## Run locally

Requires Node.js 20.11+ and Docker (for MongoDB; or set `MONGODB_URI=memory` for a throwaway database).

```bash
cd website
npm install
cp server/.env.example server/.env        # set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:up                             # MongoDB on 127.0.0.1:27027
npm run seed                              # content, catalogue and the first administrator
npm run dev                               # API on :4000, website on http://localhost:5174
```

- Website: <http://localhost:5174> · Dashboard: <http://localhost:5174/admin> (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`)
- Without SMTP settings, inquiry emails are rendered to the server log instead of being sent.

> In this workspace a development `server/.env` has already been generated (random JWT secret and
> administrator password). It is git-ignored and for local use only.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (watch) + website (Vite) |
| `npm run build` | Production build of client and server |
| `npm start` | Serve the production build (website + API) on `PORT` |
| `npm test` | Server tests: functional, security, rate limiting, SEO (Vitest + in-memory MongoDB) |
| `npm run e2e` | Browser end-to-end tests (Edge/Chrome via Playwright): journeys, CMS, 6 viewport widths |
| `npm run lighthouse` | Lighthouse audit of key pages (mobile + desktop) |
| `npm run typecheck` | TypeScript for both projects |
| `npm run seed` · `npm run seed -- --reset` | Fill missing content / reset page content to defaults |
| `ADMIN_PASSWORD=… npm run create-admin -w server -- --email you@x.com --name "You"` | Create a user or reset a password |

## Verification (run on this build)

- **Server tests:** 37 passing: public API, inquiries (validation, spam, injection, XSS-as-text), auth
  (cookies, CSRF, roles, revocation), product/category/content/settings/user management, media
  (re-encoding, disguised files, size limit, usage), CSV formula injection, sitemap/robots/meta/JSON-LD
  escaping, security headers, rate limits.
- **End-to-end:** visitor journey to a submitted quote; validation messages; products dropdown;
  category filter; mobile menu; 404; admin sign-in (wrong + right), inquiry status & notes, product
  create → publish → live → delete, page edit → live, unsafe-link rejection, media upload/alt/delete,
  non-image refusal, sign-out; **12 pages × 6 widths (1920/1440/1024/768/390/360) with no horizontal
  overflow and no console errors**, on both the dev server and the production build.
- **Lighthouse** (production build): see table above.

## Content status

Only verified information is published. Everything Arizen still has to provide shows as a marked
**"To be provided by Arizen"** placeholder: see **[docs/client-content-checklist.md](docs/client-content-checklist.md)**.
Product specifications, grades and certifications are intentionally empty until confirmed.

## Visual assets

Shipped stand-ins (procedural, no stock or AI imagery): the hero film, four product macro renders,
and five conceptual industrial illustrations (labelled as such on the site). The Google Flow / Veo /
Nano Banana production brief, prompts and replacement steps are in
**[docs/visual-production.md](docs/visual-production.md)**. Regenerate the stand-ins with:

```bash
python ../scripts/render-materials.py --width 1800 --out client/public/media/products hips abs hdpe gpps
node scripts/build-image-variants.mjs
python ../scripts/render-materials.py --out scripts/.hero hero_clear hero_white && python scripts/render-hero-video.py
python scripts/render-illustrations.py && python scripts/make-og-image.py
```

## Documentation

- [docs/deployment.md](docs/deployment.md): environment, Docker Compose or PM2, Nginx + TLS, DNS, email, backups, monitoring, launch checklist
- [docs/admin-guide.md](docs/admin-guide.md): how the Arizen team uses the CMS
- [docs/client-content-checklist.md](docs/client-content-checklist.md): what Arizen needs to supply
- [docs/visual-production.md](docs/visual-production.md): Google Flow production plan and prompts

## API (summary)

Public: `GET /api/site`, `GET /api/content/:page`, `GET /api/products[?category=]`, `GET /api/products/:slug`,
`POST /api/inquiries`, `GET /api/health`, `GET /sitemap.xml`, `GET /robots.txt`.
Admin (session cookie + `x-csrf-token` on writes): `/api/admin/auth/{login,logout,me}`, `/dashboard`,
`/products`, `/categories` (+ `/reorder`), `/content/:key`, `/inquiries` (+ `/:id/notes`, `/export.csv`),
`/media` (+ `/:id/usage`), `/settings`, `/users` (administrators only). Validation errors return
`400 { error, issues: [{ path, message }] }`.
