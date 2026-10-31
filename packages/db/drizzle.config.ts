import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './dist/schema/index.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.MIGRATOR_DATABASE_URL ||
      'postgresql://shd_migrator:test@127.0.0.1:5432/shd_tuhoctiengduc',
  },
});
