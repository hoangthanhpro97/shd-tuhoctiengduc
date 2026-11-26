'use client';

import { useState } from 'react';
import { ExamBookCover, type ExamBookCoverProps } from '../exam/ExamBookCover';

export type RealGermanBookId = 'menschen-a1' | 'schritte-a2' | 'netzwerk-b1' | 'goethe-b2-erfolg';

export interface GermanTextbookMeta {
  id: RealGermanBookId;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  publisher: string;
  imageUrl: string;
  spineGradient: string;
  badgeColor: string;
}

export const GERMAN_TEXTBOOK_COVERS: Record<RealGermanBookId, GermanTextbookMeta> = {
  'menschen-a1': {
    id: 'menschen-a1',
    title: 'Menschen A1 · Kursbuch',
    level: 'A1',
    publisher: 'Hueber',
    imageUrl: '/images/books/menschen-a1.jpg',
    spineGradient: 'from-[#b91c1c] to-[#ef4444]',
    badgeColor: 'bg-[#da2527] text-white',
  },
  'schritte-a2': {
    id: 'schritte-a2',
    title: 'Schritte international neu A2',
    level: 'A2',
    publisher: 'Hueber',
    imageUrl: '/images/books/schritte-a2.jpg',
    spineGradient: 'from-[#b91c1c] to-[#dc2626]',
    badgeColor: 'bg-[#da2527] text-white',
  },
  'netzwerk-b1': {
    id: 'netzwerk-b1',
    title: 'Netzwerk neu B1 · Kursbuch',
    level: 'B1',
    publisher: 'Klett',
    imageUrl: '/images/books/netzwerk-b1.jpg',
    spineGradient: 'from-[#0369a1] to-[#38bdf8]',
    badgeColor: 'bg-[#0284c7] text-white',
  },
  'goethe-b2-erfolg': {
    id: 'goethe-b2-erfolg',
    title: 'Mit Erfolg zum Goethe-Zertifikat B2',
    level: 'B2',
    publisher: 'Klett',
    imageUrl: '/images/books/goethe-b2-erfolg.jpg',
    spineGradient: 'from-[#0369a1] to-[#0ea5e9]',
    badgeColor: 'bg-[#0f172a] text-white',
  },
};

export type BookArtItem =
  | { kind: 'textbook'; bookId: RealGermanBookId }
  | ({ kind: 'exam' } & ExamBookCoverProps);

export function BookArtCover({
  item,
  compact = false,
  eager = false,
  className = '',
}: {
  item: BookArtItem;
  compact?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (item.kind === 'exam') {
    return (
      <div className={`inline-block select-none ${className}`}>
        <ExamBookCover
          level={item.level}
          provider={item.provider}
          simulationNumber={item.simulationNumber}
          title={item.title}
          coverImageUrl={item.coverImageUrl}
          eager={eager || compact}
          stageClassName="!h-auto !w-auto !bg-transparent !p-0"
          className="!h-auto !w-auto !rounded-none !bg-transparent !p-0"
        />
      </div>
    );
  }

  const book = GERMAN_TEXTBOOK_COVERS[item.bookId];

  return (
    <div
      className={`group/book relative flex ${
        compact ? 'h-48 w-36' : 'h-56 w-40'
      } select-none flex-col overflow-hidden rounded-r-xl rounded-l-[4px] border-r-[3px] border-b-[3px] border-[#ece6dc] bg-[#fffdf9] shadow-[0_18px_36px_-10px_rgba(15,23,42,0.22),-4px_0_8px_rgba(15,23,42,0.08)] transition-transform duration-300 ${className}`}
    >
      {/* Physical 3D Book Spine */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-2.5 bg-gradient-to-b ${book.spineGradient}`}
      >
        <div className="h-full w-full bg-gradient-to-r from-black/25 via-white/25 to-black/15" />
      </div>

      {/* Gloss sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/10 to-white/25 opacity-70"
      />

      {!imgError ? (
        <img
          src={book.imageUrl}
          alt={book.title}
          loading="eager"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/book:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-[#fbf6ee] p-4 pl-5">
          <span className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-black ${book.badgeColor}`}>
            {book.level}
          </span>
          <strong className="text-sm font-extrabold leading-snug text-slate-900">{book.title}</strong>
          <span className="text-[10px] font-bold text-slate-500">{book.publisher}</span>
        </div>
      )}
    </div>
  );
}
