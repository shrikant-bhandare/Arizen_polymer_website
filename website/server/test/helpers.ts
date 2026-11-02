import bcrypt from 'bcryptjs';
import type { Express } from 'express';
import request from 'supertest';

/** Fixture accounts that exist only in the throwaway test database. */
export const ADMIN = { name: 'Test Admin', email: 'admin@test.local', password: 'Admin-Test-Pass-2026' };
export const EDITOR = { name: 'Test Editor', email: 'editor@test.local', password: 'Editor-Test-Pass-2026' };

export async function startTestServer(): Promise<Express> {
  const { connectDatabase } = await import('../src/db');
  await connectDatabase('memory');
  const { seedDatabase } = await import('../src/seed/seed');
  await seedDatabase({ admin: ADMIN });
  const { AdminUser } = await import('../src/models/AdminUser');
  await AdminUser.create({ name: EDITOR.name, email: EDITOR.email, role: 'editor', passwordHash: await bcrypt.hash(EDITOR.password, 4) });
  const { createApp } = await import('../src/app');
  return createApp();
}

export async function stopTestServer() {
  const { disconnectDatabase } = await import('../src/db');
  await disconnectDatabase();
}

/** A cookie-keeping client signed in as the given account, plus its CSRF token. */
export async function signIn(app: Express, who: { email: string; password: string } = ADMIN) {
  const agent = request.agent(app);
  const res = await agent.post('/api/admin/auth/login').send({ email: who.email, password: who.password });
  if (res.status !== 200) throw new Error(`sign-in failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, csrf: res.body.csrfToken as string, cookies: res.headers['set-cookie'] as unknown as string[] };
}

export const validInquiry = {
  fullName: 'Priya Sharma',
  companyName: 'Example Moulders Pvt Ltd',
  email: 'priya@example.com',
  phone: '+91 98765 43210',
  product: 'hips',
  quantity: '5 MT per month',
  message: 'We need HIPS for refrigerator liners. Please share grades and pricing.',
  elapsedMs: 8000,
};
