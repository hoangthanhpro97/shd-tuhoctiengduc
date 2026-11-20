import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '../..');

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  root: repositoryRoot,
  resolve: {
    alias: {
      '@shd/contracts': resolve(repositoryRoot, 'packages/contracts/src/index.ts'),
      '@shd/core': resolve(repositoryRoot, 'packages/core/src/index.ts'),
      '@shd/db': resolve(repositoryRoot, 'packages/db/src/index.ts'),
      '@shd/adapters': resolve(repositoryRoot, 'packages/adapters/src/index.ts'),
      '@shd/config': resolve(repositoryRoot, 'packages/config/src/index.ts'),
    },
  },
  test: {
    include: ['apps/web/tests/**/*.test.ts', 'apps/web/tests/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.chrome-temp-profile/**'],
  },
});
