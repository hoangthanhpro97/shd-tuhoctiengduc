import 'server-only';
import { resolve } from 'node:path';
import { createDatabasePool, loadLocalEnv } from '@shd/db';
import { getServerEnv } from './env';

loadLocalEnv(process.cwd());
loadLocalEnv(resolve(process.cwd(), '..', '..'));

let appPool: ReturnType<typeof createDatabasePool> | undefined;
let workerPool: ReturnType<typeof createDatabasePool> | undefined;

export function getAppPool() {
  appPool ??= createDatabasePool(getServerEnv().DATABASE_URL);
  return appPool;
}

export function getWorkerPool() {
  workerPool ??= createDatabasePool(getServerEnv().WORKER_DATABASE_URL);
  return workerPool;
}
