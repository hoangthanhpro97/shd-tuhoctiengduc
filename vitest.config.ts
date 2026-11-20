import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@shd/contracts': resolve(__dirname, 'packages/contracts/src/index.ts'),
      '@shd/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@shd/db': resolve(__dirname, 'packages/db/src/index.ts'),
      '@shd/adapters': resolve(__dirname, 'packages/adapters/src/index.ts'),
      '@shd/config': resolve(__dirname, 'packages/config/src/index.ts'),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts', 'apps/**/*.test.ts', 'apps/**/*.test.tsx', 'apps/**/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.chrome-temp-profile/**'],
  },
});
