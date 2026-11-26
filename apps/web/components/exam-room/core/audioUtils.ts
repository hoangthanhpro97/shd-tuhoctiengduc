'use client';

import { useEffect, useState } from 'react';

export function resolveExamAudioUrl({
  audioUrl,
  examSlug,
  part = 1,
  level = 'B1',
}: {
  audioUrl?: string;
  examSlug?: string;
  part?: number;
  level?: string;
}): string {
  // Trust explicit external URLs or verified normalized/raw audio asset paths
  if (audioUrl) {
    if (
      audioUrl.startsWith('http://') ||
      audioUrl.startsWith('https://') ||
      audioUrl.startsWith('/audio/osd-b1/') ||
      audioUrl.startsWith('/audio/osd-b2/') ||
      audioUrl.startsWith('/audio/goethe-b1/') ||
      audioUrl.startsWith('/audio/raw-b1/') ||
      audioUrl.startsWith('/audio/raw-b2/')
    ) {
      return audioUrl;
    }
  }

  const slug = (examSlug || '').toLowerCase();
  const safePart = Math.max(1, Math.min(part, 4));

  if (slug.includes('b2') || level === 'B2') {
    const formatted = String(safePart).padStart(2, '0');
    return `/audio/raw-b2/Track No${formatted} .mp3`;
  }

  // B1 track numbering: _1_Hoeren_Teil_1.mp3 .. _15_Hoeren_Teil_4.mp3
  const match = slug.match(/test-(\d+)|mock-(\d+)|t(\d+)/i);
  const testNumber = match ? parseInt(match[1] || match[2] || match[3] || '1', 10) : 1;
  const safeTestNum = Math.min(Math.max(1, testNumber), 15);

  return `/audio/raw-b1/_${safeTestNum}_Hoeren_Teil_${safePart}.mp3`;
}

export function resolveProtectedStreamUrl(rawUrl: string): string {
  if (rawUrl.startsWith('/audio/') || rawUrl.startsWith('audio/')) {
    const normalized = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `/api/v1/media/stream?path=${encodeURIComponent(normalized)}`;
  }
  return rawUrl;
}

export interface ProtectedAudioResult {
  blobUrl: string | null;
  isLoadingAudio: boolean;
  audioFetchError: boolean;
}

/**
 * Loads media via binary stream (octet-stream) and converts it to a local Blob URL
 * in browser memory. This completely bypasses download manager extensions (such as IDM)
 * that intercept .mp3 direct URL requests and break HTML5 <audio> streaming.
 */
export function useProtectedAudioBlobUrl(rawAudioUrl: string | undefined): ProtectedAudioResult {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(Boolean(rawAudioUrl));
  const [audioFetchError, setAudioFetchError] = useState(false);

  useEffect(() => {
    if (!rawAudioUrl) {
      setBlobUrl(null);
      setIsLoadingAudio(false);
      setAudioFetchError(false);
      return;
    }

    if (rawAudioUrl.startsWith('blob:')) {
      setBlobUrl(rawAudioUrl);
      setIsLoadingAudio(false);
      setAudioFetchError(false);
      return;
    }

    const abortController = new AbortController();
    let currentBlobUrl: string | null = null;

    setIsLoadingAudio(true);
    setAudioFetchError(false);

    const streamUrl = resolveProtectedStreamUrl(rawAudioUrl);

    fetch(streamUrl, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load binary audio stream: HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (abortController.signal.aborted) return;

        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const createdBlobUrl = URL.createObjectURL(blob);
        currentBlobUrl = createdBlobUrl;

        setBlobUrl(createdBlobUrl);
        setIsLoadingAudio(false);
        setAudioFetchError(false);
      })
      .catch((err: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }
        console.error('Audio stream fetch error:', err);
        setBlobUrl(null);
        setIsLoadingAudio(false);
        setAudioFetchError(true);
      });

    return () => {
      abortController.abort();
      if (currentBlobUrl && typeof URL?.revokeObjectURL === 'function') {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [rawAudioUrl]);

  return { blobUrl, isLoadingAudio, audioFetchError };
}
