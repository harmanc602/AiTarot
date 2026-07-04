import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The 78 card images live at the repo root (`assets/img/clean`), shared with the
// mobile app. Allow Vite to serve/bundle them from outside the app dir.
const repoRoot = path.resolve(__dirname, '..', '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@aitarot/core': path.resolve(repoRoot, 'packages/core/src/index.ts'),
      '@cards': path.resolve(repoRoot, 'assets/img/clean'),
    },
  },
  server: {
    fs: {
      // Permit importing the shared core + card assets from the monorepo root.
      allow: [repoRoot],
    },
  },
});
