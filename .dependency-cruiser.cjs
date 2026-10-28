/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency creates a circular relationship.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'core-no-import-adapters-or-apps',
      severity: 'error',
      comment: 'Core package must not import adapters or apps.',
      from: {
        path: '^packages/core|^packages/testing/fixtures/invalid-dependency',
      },
      to: {
        path: '^packages/adapters|^apps',
      },
    },
    {
      name: 'contracts-no-import-core-or-db',
      severity: 'error',
      comment: 'Contracts package must not import core or db.',
      from: {
        path: '^packages/contracts',
      },
      to: {
        path: '^packages/core|^packages/db',
      },
    },
    {
      name: 'db-no-import-core',
      severity: 'error',
      comment: 'Db package must not import core.',
      from: {
        path: '^packages/db',
      },
      to: {
        path: '^packages/core',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
  },
};
