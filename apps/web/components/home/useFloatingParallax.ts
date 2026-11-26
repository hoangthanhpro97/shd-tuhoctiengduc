'use client';

import { useEffect, useState, type RefObject } from 'react';

const PLANE_FACTORS = [1, 0.5, 0.25] as const;

export interface FloatingParallaxOptions {
  paused: boolean;
  maxOffsetX?: number;
  maxOffsetY?: number;
  enablePointer?: boolean;
}

export function useFloatingParallax(
  sceneRef: RefObject<HTMLElement | null>,
  backgroundRef: RefObject<HTMLDivElement | null>,
  planeRefs: RefObject<(HTMLDivElement | null)[]>,
  options: FloatingParallaxOptions,
) {
  const { paused, maxOffsetX = 95, maxOffsetY = 65, enablePointer = true } = options;
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setPrefersReduced(motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);
    return () => motion.removeEventListener('change', syncMotion);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const layer = backgroundRef.current;
    if (!scene || !layer) return;

    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia?.('(any-pointer: fine)');

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let running = false;

    const paint = () => {
      const planes = planeRefs.current ?? [];
      planes.forEach((plane, index) => {
        if (!plane) return;
        const factor = PLANE_FACTORS[index] ?? 0.25;
        plane.style.transform = `translate3d(${(x * factor).toFixed(3)}px, ${(y * factor).toFixed(3)}px, 0)`;
      });
    };

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    const isFinePointer = () => (fine ? fine.matches : true);

    const tick = (now: number) => {
      raf = 0;
      if (!running || !enablePointer || !isFinePointer()) return;
      const dt = last ? Math.min(now - last, 50) : 16.67;
      last = now;
      // Frame-rate independent lerp (~0.08 per 60Hz frame matching docs/floating-books)
      const alpha = 1 - Math.pow(0.92, dt / 16.67);
      x += (tx - x) * alpha;
      y += (ty - y) * alpha;

      if (Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05) {
        x = tx;
        y = ty;
        paint();
        last = 0;
        return;
      }

      paint();
      raf = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (running && enablePointer && isFinePointer() && !raf) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    const sync = () => {
      const reduced = Boolean(motion?.matches);
      running = visible && !document.hidden && !reduced && !paused;
      layer.dataset.running = String(running);
      if (!running || !enablePointer || !isFinePointer()) {
        stop();
        x = 0;
        y = 0;
        tx = 0;
        ty = 0;
        paint();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!running || !enablePointer || !isFinePointer() || e.pointerType === 'touch') return;
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      tx = clamp((2 * (e.clientX - rect.left)) / rect.width - 1) * maxOffsetX;
      ty = clamp((2 * (e.clientY - rect.top)) / rect.height - 1) * maxOffsetY;
      schedule();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };

    scene.addEventListener('pointermove', onMove, { passive: true });
    scene.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', sync);
    motion?.addEventListener('change', sync);
    fine?.addEventListener('change', sync);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          visible = Boolean(entries[0]?.isIntersecting);
          sync();
        },
        { threshold: 0, rootMargin: '120px 0px' },
      );
      observer.observe(scene);
    }

    paint();
    sync();

    return () => {
      stop();
      observer?.disconnect();
      scene.removeEventListener('pointermove', onMove);
      scene.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', sync);
      motion?.removeEventListener('change', sync);
      fine?.removeEventListener('change', sync);
      delete layer.dataset.running;
    };
  }, [sceneRef, backgroundRef, planeRefs, paused, maxOffsetX, maxOffsetY, enablePointer]);

  return { prefersReduced };
}
