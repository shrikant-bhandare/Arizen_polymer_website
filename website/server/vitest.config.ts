import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { NODE_ENV: 'test', INQUIRY_RATE_LIMIT: '1000', LOGIN_RATE_LIMIT: '1000', UPLOAD_DIR: path.join(os.tmpdir(), 'arizen-test-uploads') },
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
