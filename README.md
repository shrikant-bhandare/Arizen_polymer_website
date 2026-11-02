# Arizen Polymers — corporate website

Corporate website and CMS for **Arizen Polymers India Private Limited**, built by **Neureonix**.

Everything lives in **[website/](website/)**: the React front end, the Express + MongoDB API and
CMS, shared validation, deployment kit and documentation. Start with
**[website/README.md](website/README.md)**.

Hosted on **Vercel**: `vercel.json` and `api/index.mjs` at the repository root wire it up; setup
(MongoDB Atlas, Vercel Blob, environment variables) is in
**[website/docs/deploy-vercel.md](website/docs/deploy-vercel.md)**.

```bash
cd website
npm install
npm run db:up && npm run seed
npm run dev        # website on http://localhost:5174, dashboard at /admin
```
