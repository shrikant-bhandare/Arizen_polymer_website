import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The production build is a single self-contained index.html (scripts, styles,
// fonts and images inlined) so the proposal can be opened from disk, emailed,
// or hosted on any static server without extra files.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
