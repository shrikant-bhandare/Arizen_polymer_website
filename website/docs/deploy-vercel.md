# Deploying on Vercel

The repository is ready for Vercel: `/vercel.json` installs and builds from `website/`, serves the
built assets from Vercel's CDN, and routes every page and API request to one serverless function
(`/api/index.mjs` → the Express app). Each page therefore still gets its own server-rendered title,
description, canonical URL and structured data.

Vercel has no database or writable disk, so two services are added:

| Need | Service | Why |
|---|---|---|
| Database | **MongoDB Atlas** (free M0 tier is enough to start) | Products, pages, inquiries, users |
| Uploaded images | **Vercel Blob** (Storage tab in Vercel) | The media library cannot write to a function's disk |

## 1. MongoDB Atlas

1. Create a cluster at <https://cloud.mongodb.com> (region close to India, e.g. Mumbai `ap-south-1`).
2. **Database Access** → add a database user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (Vercel functions do not have fixed IP addresses).
4. **Connect → Drivers** → copy the connection string and put the database name in it:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/arizen?retryWrites=true&w=majority`

Keep this string private; it goes into Vercel and your own terminal only.

## 2. Vercel project

1. In the Vercel project for this repository, keep **Root Directory** empty (the repository root)
   and leave the Build, Output and Install settings on their defaults; `vercel.json` sets them.
2. **Storage → Create → Blob**, then connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`
   automatically.
3. **Settings → Environment Variables** (Production, and Preview if you use previews):

| Name | Value |
|---|---|
| `MONGODB_URI` | The Atlas connection string from step 1 |
| `JWT_SECRET` | 48+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SITE_URL` | The public address, e.g. `https://arizen-polymer-website.vercel.app` (later your domain) |
| `TRUST_PROXY` | `1` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional: mailbox that sends inquiry notifications |
| `NOTIFY_EMAILS` | Optional: extra notification recipients, comma-separated |

4. **Deployments → Redeploy** (or push a commit) so the variables take effect.

## 3. Load the starting content (once)

The Atlas database starts empty. From the `website/` folder on your computer, run the seed against
Atlas. It adds the pages, the four products and the first administrator, and never overwrites
existing data.

PowerShell:

```powershell
$env:MONGODB_URI="<atlas connection string>"; $env:ADMIN_EMAIL="you@company.com"; $env:ADMIN_PASSWORD="<12+ chars, upper, lower, number>"; $env:ADMIN_NAME="Your Name"; npm run seed
```

Git Bash / macOS / Linux:

```bash
MONGODB_URI="<atlas connection string>" ADMIN_EMAIL="you@company.com" ADMIN_PASSWORD="<12+ chars, upper, lower, number>" ADMIN_NAME="Your Name" npm run seed
```

Variables set on the command line take precedence over `server/.env`, so your local settings are
not used for this.

Then sign in at `https://<your-site>/admin` and, in **Settings**, set **Public website address**
to the same value as `SITE_URL`.

## 4. Custom domain

**Settings → Domains** → add `www.yourdomain.com` and the apex domain; follow Vercel's DNS
instructions. Update `SITE_URL` and the dashboard's **Public website address** to the final domain,
then redeploy.

## Notes and limits on Vercel

- **Uploads:** images up to 4 MB (Vercel's request limit is 4.5 MB). They are converted to WebP/AVIF
  and stored in Vercel Blob; existing bundled images in `client/public/media` are served from the CDN.
- **First request after idle** starts a function instance and connects to Atlas (cold start, typically
  1–2 s). Later requests reuse the connection.
- **Rate limits** (sign-in, inquiries) are counted per function instance, so they are softer than on a
  single server. For strict limits, add a shared store such as Upstash Redis.
- **Logs:** Vercel → Project → Logs. Health check: `GET /api/health`.
- **Testing the Vercel build locally:** `npm run build:vercel`, then
  `NODE_ENV=production node scripts/vercel-simulate.mjs` and open <http://localhost:4200>.
