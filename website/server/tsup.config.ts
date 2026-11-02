import { defineConfig } from 'tsup';

// Bundles the server and the shared validation code into dist/index.js;
// npm dependencies stay external and are installed on the server.
export default defineConfig({
  entry: { index: 'src/index.ts', seed: 'src/scripts/seed.ts', 'create-admin': 'src/scripts/create-admin.ts' },
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: true,
  // Development/test-only database; never part of the production bundle.
  external: ['mongodb-memory-server'],
});
