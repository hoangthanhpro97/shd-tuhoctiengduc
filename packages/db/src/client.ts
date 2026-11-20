import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export type DatabasePool = pg.Pool;

export function loadLocalEnv(repositoryRoot = process.cwd()): void {
  const envPath = resolve(repositoryRoot, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/u, '$2');
    if (!process.env[key]) process.env[key] = value;
  }
}

export function createDatabasePool(connectionString: string): DatabasePool {
  return new pg.Pool({ connectionString });
}

export function createDrizzleDatabase(pool: DatabasePool) {
  return drizzle(pool);
}

export async function closeDatabasePool(pool: DatabasePool): Promise<void> {
  await pool.end();
}
