import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GET, HEAD } from '../app/api/v1/media/stream/route';
import { resolveProtectedStreamUrl } from '../components/exam-room/core/audioUtils';

const testFixtureDir = path.resolve(__dirname, '../public/audio/test-fixtures');
const testFixtureFile = path.join(testFixtureDir, 'stream-test.mp3');
const testFixturePath = '/audio/test-fixtures/stream-test.mp3';

describe('Media Stream Protection API & Utils', () => {
  beforeAll(() => {
    if (!fs.existsSync(testFixtureDir)) {
      fs.mkdirSync(testFixtureDir, { recursive: true });
    }
    fs.writeFileSync(testFixtureFile, Buffer.alloc(2048, 0x41));
  });

  afterAll(() => {
    try {
      if (fs.existsSync(testFixtureFile)) fs.unlinkSync(testFixtureFile);
      if (fs.existsSync(testFixtureDir)) fs.rmdirSync(testFixtureDir);
    } catch {
      // ignore
    }
  });

  it('correctly maps raw audio URL to protected media stream URL', () => {
    const url1 = resolveProtectedStreamUrl('/audio/osd-b1/test-05-teil-1.mp3');
    expect(url1).toBe('/api/v1/media/stream?path=%2Faudio%2Fosd-b1%2Ftest-05-teil-1.mp3');

    const url2 = resolveProtectedStreamUrl('audio/osd-b2/test-01-aufgabe-1.mp3');
    expect(url2).toBe('/api/v1/media/stream?path=%2Faudio%2Fosd-b2%2Ftest-01-aufgabe-1.mp3');

    const blobUrl = 'blob:http://localhost:3000/d74ba125-9a8f';
    expect(resolveProtectedStreamUrl(blobUrl)).toBe(blobUrl);

    const externalUrl = 'https://cdn.example.com/audio/sample.mp3';
    expect(resolveProtectedStreamUrl(externalUrl)).toBe(externalUrl);
  });

  it('returns 400 when path query parameter is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/media/stream');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing path parameter');
  });

  it('rejects path traversal with 400', async () => {
    const req1 = new Request('http://localhost:3000/api/v1/media/stream?path=../../package.json');
    const res1 = await GET(req1);
    expect(res1.status).toBe(400);

    const req2 = new Request('http://localhost:3000/api/v1/media/stream?path=/audio/..%2F..%2Fsecret.mp3');
    const res2 = await GET(req2);
    expect(res2.status).toBe(400);
  });

  it('rejects disallowed extensions with 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/media/stream?path=/audio/test.exe');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Unsupported media type');
  });

  it('returns 404 for non-existent audio file', async () => {
    const req = new Request('http://localhost:3000/api/v1/media/stream?path=/audio/osd-b1/non-existent-test-99.mp3');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('successfully streams valid audio file with octet-stream and security headers', async () => {
    const req = new Request(`http://localhost:3000/api/v1/media/stream?path=${encodeURIComponent(testFixturePath)}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/octet-stream');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400, immutable');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');

    const contentLength = Number(res.headers.get('Content-Length'));
    expect(contentLength).toBe(2048);

    const buffer = await res.arrayBuffer();
    expect(buffer.byteLength).toBe(2048);
  });

  it('handles HEAD request matching GET headers', async () => {
    const req = new Request(`http://localhost:3000/api/v1/media/stream?path=${encodeURIComponent(testFixturePath)}`);
    const res = await HEAD(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/octet-stream');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400, immutable');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
