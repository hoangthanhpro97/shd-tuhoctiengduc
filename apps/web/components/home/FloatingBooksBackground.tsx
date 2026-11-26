'use client';

import { Pause, Play } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { BookArtCover, type BookArtItem } from './BookArtCover';
import { useFloatingParallax } from './useFloatingParallax';

export interface FloatingBookSlot {
  id: string;
  plane: 0 | 1 | 2;
  item: BookArtItem;
  x: number;
  y: number;
  scale: number;
  angle: number;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
  drift: number;
  driftX: number;
}

export type FloatingBooksVariant = 'hero' | 'features' | 'library' | 'roadmap' | 'student-edge';

interface FloatingMotionContextValue {
  paused: boolean;
  prefersReduced: boolean;
  togglePaused: () => void;
}

const FloatingMotionContext = createContext<FloatingMotionContextValue>({
  paused: false,
  prefersReduced: false,
  togglePaused: () => {},
});

export function FloatingLibraryProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const togglePaused = useCallback(() => setPaused((prev) => !prev), []);

  const value = useMemo(
    () => ({ paused, prefersReduced, togglePaused }),
    [paused, prefersReduced, togglePaused],
  );

  return <FloatingMotionContext.Provider value={value}>{children}</FloatingMotionContext.Provider>;
}

export function FloatingLibraryMotionToggle({ className = '' }: { className?: string }) {
  const { paused, prefersReduced, togglePaused } = useContext(FloatingMotionContext);
  if (prefersReduced) return null;

  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-pressed={paused}
      data-fb-pause
      data-testid="floating-books-motion-toggle"
      className={`shd-fb-pause ${className}`}
    >
      {paused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
      <span>{paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}</span>
    </button>
  );
}

/* Balanced 360° surrounding composition (top, left, right, corners, lower transition)
   following docs/floating-books slot symmetry without obscuring centered typography. */
const HERO_SLOTS: FloatingBookSlot[] = [
  // Plane 0: Near (100% mouse parallax, largest, crispest)
  {
    id: 'hero-near-osd-b1',
    plane: 0,
    item: { kind: 'exam', level: 'B1', provider: 'osd', simulationNumber: '01', title: 'ÖSD Zertifikat B1 · Tập 1' },
    x: 11,
    y: 35,
    scale: 0.96,
    angle: -12,
    opacity: 0.92,
    blur: 0,
    duration: 6.8,
    delay: -1.1,
    drift: 16,
    driftX: 6,
  },
  {
    id: 'hero-near-goethe-b2',
    plane: 0,
    item: { kind: 'exam', level: 'B2', provider: 'goethe', simulationNumber: '01', title: 'Goethe-Zertifikat B2 · Tập 1' },
    x: 88,
    y: 74,
    scale: 1.0,
    angle: 11,
    opacity: 0.92,
    blur: 0,
    duration: 7.7,
    delay: -2.4,
    drift: 18,
    driftX: 7,
  },
  {
    id: 'hero-near-menschen-a1',
    plane: 0,
    item: { kind: 'textbook', bookId: 'menschen-a1' },
    x: 14,
    y: 84,
    scale: 0.92,
    angle: 10,
    opacity: 0.88,
    blur: 0,
    duration: 8.5,
    delay: -3.5,
    drift: 16,
    driftX: 6,
  },
  // Plane 1: Middle (50% mouse parallax, mid size, subtle blur)
  {
    id: 'hero-mid-telc-b1',
    plane: 1,
    item: { kind: 'exam', level: 'B1', provider: 'telc', simulationNumber: '01', title: 'telc Deutsch B1 · Tập 1' },
    x: 86,
    y: 28,
    scale: 0.82,
    angle: -11,
    opacity: 0.68,
    blur: 0.5,
    duration: 9.2,
    delay: -1.8,
    drift: 14,
    driftX: 5,
  },
  {
    id: 'hero-mid-netzwerk-b1',
    plane: 1,
    item: { kind: 'textbook', bookId: 'netzwerk-b1' },
    x: 31,
    y: 16,
    scale: 0.78,
    angle: -7,
    opacity: 0.58,
    blur: 0.6,
    duration: 10.1,
    delay: -4.2,
    drift: 12,
    driftX: 5,
  },
  {
    id: 'hero-mid-schritte-a2',
    plane: 1,
    item: { kind: 'textbook', bookId: 'schritte-a2' },
    x: 72,
    y: 92,
    scale: 0.80,
    angle: -9,
    opacity: 0.62,
    blur: 0.6,
    duration: 8.9,
    delay: -0.9,
    drift: 14,
    driftX: 5,
  },
  // Plane 2: Far (25% mouse parallax, small scale, low opacity, depth blur)
  {
    id: 'hero-far-erfolg-b2',
    plane: 2,
    item: { kind: 'textbook', bookId: 'goethe-b2-erfolg' },
    x: 3,
    y: 60,
    scale: 0.64,
    angle: 12,
    opacity: 0.36,
    blur: 1.5,
    duration: 11.4,
    delay: -5.1,
    drift: 11,
    driftX: 4,
  },
  {
    id: 'hero-far-osd-b2',
    plane: 2,
    item: { kind: 'exam', level: 'B2', provider: 'osd', simulationNumber: '02', title: 'ÖSD Zertifikat B2 · Tập 2' },
    x: 97,
    y: 50,
    scale: 0.64,
    angle: -13,
    opacity: 0.36,
    blur: 1.5,
    duration: 12.1,
    delay: -2.9,
    drift: 11,
    driftX: 4,
  },
  {
    id: 'hero-far-goethe-b1',
    plane: 2,
    item: { kind: 'exam', level: 'B1', provider: 'goethe', simulationNumber: '02', title: 'Goethe-Zertifikat B1 · Tập 2' },
    x: 69,
    y: 15,
    scale: 0.60,
    angle: 8,
    opacity: 0.32,
    blur: 1.5,
    duration: 10.8,
    delay: -6.3,
    drift: 10,
    driftX: 4,
  },
];

const FEATURES_SLOTS: FloatingBookSlot[] = [
  {
    id: 'feat-mid-schritte',
    plane: 1,
    item: { kind: 'textbook', bookId: 'schritte-a2' },
    x: 2.5,
    y: 28,
    scale: 0.68,
    angle: -10,
    opacity: 0.42,
    blur: 0.6,
    duration: 9.4,
    delay: -1.4,
    drift: 13,
    driftX: 5,
  },
  {
    id: 'feat-near-netzwerk',
    plane: 0,
    item: { kind: 'textbook', bookId: 'netzwerk-b1' },
    x: 97.5,
    y: 74,
    scale: 0.72,
    angle: 9,
    opacity: 0.48,
    blur: 0.2,
    duration: 8.6,
    delay: -3.2,
    drift: 14,
    driftX: 5,
  },
  {
    id: 'feat-far-osd-b1',
    plane: 2,
    item: { kind: 'exam', level: 'B1', provider: 'osd', simulationNumber: '03', title: 'ÖSD Zertifikat B1 · Tập 3' },
    x: 97,
    y: 22,
    scale: 0.56,
    angle: -8,
    opacity: 0.28,
    blur: 1.3,
    duration: 11.2,
    delay: -2.1,
    drift: 10,
    driftX: 4,
  },
];

const LIBRARY_SLOTS: FloatingBookSlot[] = [
  {
    id: 'lib-mid-menschen',
    plane: 1,
    item: { kind: 'textbook', bookId: 'menschen-a1' },
    x: 2,
    y: 34,
    scale: 0.66,
    angle: -11,
    opacity: 0.40,
    blur: 0.7,
    duration: 9.8,
    delay: -2.0,
    drift: 12,
    driftX: 4,
  },
  {
    id: 'lib-near-goethe-b2',
    plane: 0,
    item: { kind: 'textbook', bookId: 'goethe-b2-erfolg' },
    x: 98,
    y: 76,
    scale: 0.68,
    angle: 10,
    opacity: 0.44,
    blur: 0.3,
    duration: 8.8,
    delay: -4.0,
    drift: 13,
    driftX: 5,
  },
  {
    id: 'lib-far-osd-b2',
    plane: 2,
    item: { kind: 'exam', level: 'B2', provider: 'osd', simulationNumber: '02', title: 'ÖSD Zertifikat B2 · Tập 2' },
    x: 2.5,
    y: 80,
    scale: 0.56,
    angle: 12,
    opacity: 0.26,
    blur: 1.4,
    duration: 11.6,
    delay: -1.5,
    drift: 10,
    driftX: 4,
  },
];

const ROADMAP_SLOTS: FloatingBookSlot[] = [
  {
    id: 'road-mid-schritte',
    plane: 1,
    item: { kind: 'textbook', bookId: 'schritte-a2' },
    x: 2,
    y: 35,
    scale: 0.62,
    angle: -12,
    opacity: 0.36,
    blur: 0.8,
    duration: 9.6,
    delay: -1.9,
    drift: 12,
    driftX: 4,
  },
  {
    id: 'road-far-menschen',
    plane: 2,
    item: { kind: 'textbook', bookId: 'menschen-a1' },
    x: 98,
    y: 68,
    scale: 0.56,
    angle: 10,
    opacity: 0.28,
    blur: 1.4,
    duration: 11.4,
    delay: -3.7,
    drift: 10,
    driftX: 4,
  },
];

const STUDENT_EDGE_SLOTS: FloatingBookSlot[] = [
  {
    id: 'stu-near-netzwerk',
    plane: 0,
    item: { kind: 'textbook', bookId: 'netzwerk-b1' },
    x: 97.5,
    y: 78,
    scale: 0.68,
    angle: -8,
    opacity: 0.48,
    blur: 0.2,
    duration: 8.5,
    delay: -1.2,
    drift: 13,
    driftX: 5,
  },
  {
    id: 'stu-mid-goethe',
    plane: 1,
    item: { kind: 'exam', level: 'B1', provider: 'goethe', simulationNumber: '01', title: 'Goethe-Zertifikat B1 · Tập 1' },
    x: 97.5,
    y: 22,
    scale: 0.60,
    angle: 9,
    opacity: 0.38,
    blur: 0.7,
    duration: 9.9,
    delay: -3.1,
    drift: 11,
    driftX: 4,
  },
  {
    id: 'stu-far-osd',
    plane: 2,
    item: { kind: 'exam', level: 'B2', provider: 'osd', simulationNumber: '01', title: 'ÖSD Zertifikat B2 · Tập 1' },
    x: 2,
    y: 74,
    scale: 0.56,
    angle: -10,
    opacity: 0.30,
    blur: 1.3,
    duration: 11.5,
    delay: -2.4,
    drift: 10,
    driftX: 4,
  },
];

const SLOTS_BY_VARIANT: Record<FloatingBooksVariant, FloatingBookSlot[]> = {
  hero: HERO_SLOTS,
  features: FEATURES_SLOTS,
  library: LIBRARY_SLOTS,
  roadmap: ROADMAP_SLOTS,
  'student-edge': STUDENT_EDGE_SLOTS,
};

export function FloatingBooksBackground({
  sceneRef,
  variant = 'hero',
  className = '',
}: {
  sceneRef: RefObject<HTMLElement | null>;
  variant?: FloatingBooksVariant;
  className?: string;
}) {
  const { paused } = useContext(FloatingMotionContext);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isHero = variant === 'hero';
  useFloatingParallax(sceneRef, backgroundRef, planeRefs, {
    paused,
    maxOffsetX: isHero ? 95 : 46,
    maxOffsetY: isHero ? 65 : 32,
    enablePointer: true,
  });

  const slots = SLOTS_BY_VARIANT[variant];
  const slotsByPlane: Record<0 | 1 | 2, FloatingBookSlot[]> = {
    0: slots.filter((s) => s.plane === 0),
    1: slots.filter((s) => s.plane === 1),
    2: slots.filter((s) => s.plane === 2),
  };

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      data-testid={isHero ? 'floating-books-bg' : `floating-books-${variant}`}
      className={`shd-fb-background ${!isHero ? 'hidden min-[1360px]:block' : ''} ${className}`}
    >
      {/* Far -> Middle -> Near planes for natural depth */}
      {([2, 1, 0] as const).map((planeIndex) => (
        <div
          key={planeIndex}
          data-plane={planeIndex}
          ref={(el) => {
            planeRefs.current[planeIndex] = el;
          }}
          className="shd-fb-plane"
        >
          {slotsByPlane[planeIndex].map((slot) => {
            const style = {
              '--x': `${slot.x}%`,
              '--y': `${slot.y}%`,
              '--scale': slot.scale,
              '--angle': `${slot.angle}deg`,
              '--opacity': slot.opacity,
              '--blur': `${slot.blur}px`,
              '--duration': `${slot.duration}s`,
              '--delay': `${slot.delay}s`,
              '--drift': `${slot.drift}px`,
              '--drift-x': `${slot.driftX}px`,
            } as CSSProperties;

            return (
              <div
                key={slot.id}
                data-depth={slot.plane}
                style={style}
                className="shd-fb-book"
              >
                <div className="shd-fb-drift">
                  <BookArtCover item={slot.item} compact eager />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Gradient Protection Mask (centered spotlight vs gutter margins) */}
      <div className={isHero ? 'shd-fb-mask' : 'shd-fb-mask-edges'} />
    </div>
  );
}
