# Deployment guide

> Nothing here has been run against live infrastructure. Deploying, changing DNS, or
> provisioning servers needs Arizen's explicit authorisation, and the domain and hosting
> should be registered in Arizen's name (proposal terms).

The app is one Node.js process that serves the website, the CMS dashboard, the API, uploaded
media, `sitemap.xml` and `robots.txt`, backed by MongoDB. Put it behind Nginx (or any HTTPS
reverse proxy). Two supported routes:

- **A. Docker Compose** (recommended): Nginx + app + MongoDB on one VPS.
- **B. PM2 on a VPS**: Node and MongoDB (or MongoDB Atlas) installed directly.

Minimum server: 2 vCPU, 2 GB RAM, 30 GB SSD, Ubuntu 24.04 LTS.

---

## 1. Environment variables

Create `server/.env.production` from `server/.env.example` and set at least:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | 48+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SITE_URL` | `https://www.<domain>` |
| `MONGODB_URI` | Set by compose (route A), or your Atlas / local URI (route B) |
| `TRUST_PROXY` | `1` (one proxy, Nginx) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | The mailbox that sends inquiry notifications |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | First administrator (used once by the seed) |

The server refuses to start in production without a strong `JWT_SECRET`. Keep this file out of
version control (`.gitignore` already covers `server/.env*`); restrict it with `chmod 600`.

## 2A. Docker Compose

```bash
# on the server, in /opt/arizen
git clone <repository> . && cd website
cp server/.env.example server/.env.production   # then edit it
docker compose -f deploy/docker-compose.prod.yml up -d --build app mongo
docker compose -f deploy/docker-compose.prod.yml exec app node server/dist/seed.js
```

TLS certificate (first time), then start Nginx:

```bash
sudo apt install certbot
sudo certbot certonly --webroot -w /var/www/certbot -d example.com -d www.example.com   # with a temporary port-80 server, or --standalone before Nginx starts
# edit deploy/nginx.conf: replace example.com with the real domain
docker compose -f deploy/docker-compose.prod.yml up -d nginx
```

Renewal: `0 3 * * * certbot renew --quiet && docker compose -f /opt/arizen/website/deploy/docker-compose.prod.yml exec nginx nginx -s reload`

Updates: `git pull && docker compose -f deploy/docker-compose.prod.yml up -d --build app`

## 2B. PM2 on a VPS

```bash
# Node 22 LTS and MongoDB 8 installed; Nginx installed from apt
cd /opt/arizen/website
npm ci && npm run build
cp server/.env.example server/.env.production  # edit
NODE_ENV=production node --env-file=server/.env.production server/dist/seed.js
sudo mkdir -p /var/log/arizen && sudo chown $USER /var/log/arizen
npm i -g pm2 && pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
```

Use `deploy/nginx.conf` in `/etc/nginx/sites-available/arizen` with `server 127.0.0.1:4000;` in the
upstream, then `sudo certbot --nginx -d example.com -d www.example.com`.

## 3. Domain

| Record | Name | Value |
|---|---|---|
| A | `@` | server IPv4 |
| A | `www` | server IPv4 |
| AAAA | `@`, `www` | server IPv6 (if available) |

Nginx redirects the apex and plain HTTP to `https://www.<domain>`. Set **Settings → Public website
address** in the dashboard to the same URL (canonical links, sitemap and sharing previews use it).

## 4. Email (inquiry notifications)

Use the company mailbox's SMTP (Google Workspace, Microsoft 365, Zoho) or a transactional
provider. Add SPF/DKIM for the sending domain. Set recipients in **Settings → Inquiry notifications**.
Without SMTP settings, inquiries are still stored and shown in the dashboard; emails are only logged.

## 5. Backups

`deploy/backup.sh` dumps MongoDB and archives uploads nightly, keeping 14 days:

```bash
chmod +x deploy/backup.sh
crontab -e   # 30 2 * * * /opt/arizen/website/deploy/backup.sh >> /var/log/arizen/backup.log 2>&1
```

Copy `/var/backups/arizen` off the server (object storage or another machine). Test a restore
quarterly:

```bash
docker compose -f deploy/docker-compose.prod.yml exec -T mongo mongorestore --archive --gzip --drop < db-YYYY-MM-DD_HHMM.archive.gz
docker compose -f deploy/docker-compose.prod.yml exec -T app tar -xzf - -C /app < uploads-YYYY-MM-DD_HHMM.tar.gz
```

## 6. Logging & monitoring

- App logs are structured JSON (pino) on stdout: `docker compose logs -f app` or `/var/log/arizen/*.log` (PM2).
  Request logs never include headers or cookies; passwords are redacted.
- Health check: `GET /api/health` → `200 {"ok":true}` when the database is connected.
  Point an uptime monitor (UptimeRobot, Better Stack) at it.
- PM2: `pm2 install pm2-logrotate`. Docker: log rotation is configured in `/etc/docker/daemon.json` (`"log-opts": {"max-size": "10m", "max-file": "5"}`).

## 7. Security checklist before launch

- [ ] `JWT_SECRET` is unique and long; `.env.production` is `chmod 600`.
- [ ] HTTPS only; HSTS is sent by the app in production.
- [ ] MongoDB is not exposed publicly (compose does not publish its port; with PM2, bind to 127.0.0.1 and enable auth).
- [ ] Firewall allows only 22, 80 and 443 (`ufw allow OpenSSH; ufw allow 'Nginx Full'; ufw enable`).
- [ ] The seed administrator's password has been changed after first sign-in; one account per person.
- [ ] Backups run and a restore has been tested.
- [ ] Settings → Public website address set; sitemap submitted in Google Search Console.
- [ ] Placeholders switched off once the content checklist is complete.
