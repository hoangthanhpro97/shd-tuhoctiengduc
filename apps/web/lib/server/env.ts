import 'server-only';
import { z } from 'zod';

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  WORKER_DATABASE_URL: z.string().url(),
  VISITOR_TOKEN_PEPPER: z.string().min(16).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  OTP_PROVIDER: z.enum(['mock', 'zns', 'sms']).default('mock'),
});

let cached: z.infer<typeof ServerEnvSchema> | null = null;

export function getServerEnv() {
  cached ??= ServerEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    WORKER_DATABASE_URL: process.env.WORKER_DATABASE_URL,
    VISITOR_TOKEN_PEPPER: process.env.VISITOR_TOKEN_PEPPER ?? process.env.PHONE_HASH_PEPPER,
    NODE_ENV: process.env.NODE_ENV,
    OTP_PROVIDER: process.env.OTP_PROVIDER,
  });
  return cached;
}
