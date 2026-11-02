import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Environment variables come from the process (production) or server/.env (development).
const envFile = path.join(serverRoot, '.env');
if (existsSync(envFile) && process.env.NODE_ENV !== 'test') process.loadEnvFile(envFile);

const list = z
  .string()
  .default('')
  .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27027/arizen'),
  JWT_SECRET: z.string().default(''),
  SESSION_HOURS: z.coerce.number().positive().max(72).default(8),
  CORS_ORIGINS: list,
  SITE_URL: z.string().default('http://localhost:4000'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  UPLOAD_DIR: z.string().default(path.join(serverRoot, 'uploads')),
  CLIENT_DIST: z.string().default(path.resolve(serverRoot, '../client/dist')),
  // Vercel functions accept request bodies up to 4.5 MB, so 4 MB is the default everywhere.
  MAX_UPLOAD_MB: z.coerce.number().positive().max(50).default(4),
  /** Set on Vercel: uploads are stored in Vercel Blob instead of on disk. */
  BLOB_READ_WRITE_TOKEN: z.string().default(''),
  /** Per address: inquiries per hour and failed sign-ins per 15 minutes. */
  INQUIRY_RATE_LIMIT: z.coerce.number().int().positive().default(8),
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(10),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('Arizen Polymers Website <no-reply@localhost>'),
  NOTIFY_EMAILS: list,
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

// Blank entries (e.g. `UPLOAD_DIR=` copied from .env.example) mean "not set", so defaults apply.
const parsed = schema.parse(Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== '')));

if (parsed.NODE_ENV === 'production') {
  // Fail fast rather than run in production with a guessable signing key.
  if (parsed.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set to at least 32 random characters in production.');
  if (!parsed.SITE_URL.startsWith('https://')) console.warn('[config] SITE_URL should be the public https:// address in production.');
} else if (!parsed.JWT_SECRET) {
  parsed.JWT_SECRET = 'development-only-secret-do-not-use-in-production-0000';
}

export const config = {
  ...parsed,
  isProd: parsed.NODE_ENV === 'production',
  isTest: parsed.NODE_ENV === 'test',
  siteUrl: parsed.SITE_URL.replace(/\/+$/, ''),
  serverRoot,
};
