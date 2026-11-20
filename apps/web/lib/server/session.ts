import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { getAppPool } from './db';
import { getServerEnv } from './env';

export const VISITOR_COOKIE = 'shd_visitor';

export function hashVisitorToken(rawToken: string): string {
  return createHmac('sha256', getServerEnv().VISITOR_TOKEN_PEPPER ?? 'development-only-visitor-pepper').update(rawToken).digest('hex');
}

export async function ensureVisitor(request: NextRequest, response: NextResponse): Promise<string> {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const rawToken = existing ?? randomBytes(32).toString('hex');
  const tokenHash = hashVisitorToken(rawToken);
  const userAgent = request.headers.get('user-agent');
  try {
    await getAppPool().query('SELECT create_visitor($1, $2, $3)', [tokenHash, userAgent, null]);
  } catch (error) {
    // Local fixture attempts still need a stable visitor cookie when PostgreSQL is offline.
    console.warn('visitor persistence unavailable; continuing with local runtime:', error instanceof Error ? error.message : error);
  }
  if (!existing) {
    response.cookies.set(VISITOR_COOKIE, rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return tokenHash;
}

export function getVisitorTokenHash(request: NextRequest): string | null {
  const rawToken = request.cookies.get(VISITOR_COOKIE)?.value;
  return rawToken ? hashVisitorToken(rawToken) : null;
}
