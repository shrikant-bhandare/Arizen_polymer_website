import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ADMIN, validInquiry } from './helpers';

// This file runs in its own module graph, so production-like limits apply here only.
process.env.LOGIN_RATE_LIMIT = '3';
process.env.INQUIRY_RATE_LIMIT = '2';

let app: Express;
beforeAll(async () => {
  const { startTestServer } = await import('./helpers');
  app = await startTestServer();
});
afterAll(async () => {
  const { stopTestServer } = await import('./helpers');
  await stopTestServer();
});

describe('rate limiting', () => {
  it('locks out repeated failed sign-ins', async () => {
    for (let i = 0; i < 3; i++) await request(app).post('/api/admin/auth/login').send({ email: ADMIN.email, password: 'wrong' }).expect(401);
    const res = await request(app).post('/api/admin/auth/login').send({ email: ADMIN.email, password: ADMIN.password }).expect(429);
    expect(res.body.error).toMatch(/Too many sign-in attempts/);
  });

  it('caps inquiry submissions per address', async () => {
    await request(app).post('/api/inquiries').send(validInquiry).expect(201);
    await request(app).post('/api/inquiries').send(validInquiry).expect(201);
    await request(app).post('/api/inquiries').send(validInquiry).expect(429);
  });
});
