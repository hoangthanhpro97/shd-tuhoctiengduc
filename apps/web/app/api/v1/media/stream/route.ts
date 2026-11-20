import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

export const dynamic = 'force-dynamic';

const candidateAudioDirs = [
  path.resolve(process.cwd(), 'apps/web/public/audio'),
  path.resolve(process.cwd(), 'public/audio'),
  path.resolve(process.cwd(), '../public/audio'),
];

function getAudioRootDir(): string | null {
  for (const dir of candidateAudioDirs) {
    if (existsSync(dir)) {
      return dir;
    }
  }
  return null;
}

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.m4a', '.wav', '.ogg']);

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('path');

  if (!rawPath) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Security: reject null bytes, backslashes, or explicit traversal tokens
  if (rawPath.includes('\0') || rawPath.includes('..')) {
    return new Response(JSON.stringify({ error: 'Invalid path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalize subpath relative to audio root
  let subpath = rawPath.replace(/\\/gu, '/').trim();
  while (subpath.startsWith('/')) {
    subpath = subpath.slice(1);
  }
  if (subpath.startsWith('audio/')) {
    subpath = subpath.slice('audio/'.length);
  }

  const ext = path.extname(subpath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return new Response(JSON.stringify({ error: 'Unsupported media type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const audioRootDir = getAudioRootDir();

  if (audioRootDir) {
    const targetPath = path.resolve(audioRootDir, subpath);
    const rel = path.relative(audioRootDir, targetPath);

    // Ensure path resolves strictly within the audio directory
    if (!rel.startsWith('..') && !path.isAbsolute(rel) && existsSync(targetPath)) {
      try {
        const fileStat = await stat(targetPath);
        if (fileStat.isFile()) {
          const stream = createReadStream(targetPath);
          const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

          return new Response(webStream, {
            status: 200,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': String(fileStat.size),
              'Cache-Control': 'public, max-age=86400, immutable',
              'X-Content-Type-Options': 'nosniff',
            },
          });
        }
      } catch (err) {
        console.error('Error reading audio file:', err);
      }
    }
  }

  // Fallback: proxy from NEXT_PUBLIC_AUDIO_BASE_URL if configured
  const cdnBase = process.env.NEXT_PUBLIC_AUDIO_BASE_URL;
  if (cdnBase) {
    try {
      const cdnUrl = `${cdnBase.replace(/\/+$/u, '')}/${subpath}`;
      const cdnRes = await fetch(cdnUrl);
      if (cdnRes.ok && cdnRes.body) {
        const contentLength = cdnRes.headers.get('content-length');
        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
        };
        if (contentLength) headers['Content-Length'] = contentLength;

        return new Response(cdnRes.body, {
          status: 200,
          headers,
        });
      }
    } catch (err) {
      console.error('Error proxying audio from CDN:', err);
    }
  }

  return new Response(JSON.stringify({ error: 'Audio file not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function HEAD(request: Request): Promise<Response> {
  const getResponse = await GET(request);
  return new Response(null, {
    status: getResponse.status,
    headers: getResponse.headers,
  });
}
