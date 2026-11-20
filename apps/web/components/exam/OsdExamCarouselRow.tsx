'use client';

import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { ExamBookCover } from './ExamBookCover';

const stageClasses = ['bg-sky-100/80', 'bg-cyan-100/80', 'bg-indigo-100/80', 'bg-teal-100/80'];

function testNumber(slug: string) {
  return (slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01').padStart(2, '0');
}

function displayTitle(exam: PublicExamSummary) {
  return `ÖSD ${exam.cefrLevel} · Modelltest ${testNumber(exam.slug)}`;
}

export function OsdExamCarouselRow({ exams }: { exams: PublicExamSummary[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, distance: 0 });
  const suppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [exams.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { active: true, startX: event.clientX, startScrollLeft: track.scrollLeft, distance: 0 };
    suppressClickRef.current = false;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag.active || !track) return;
    const delta = event.clientX - drag.startX;
    drag.distance = Math.abs(delta);
    if (drag.distance > 6) {
      event.preventDefault();
      suppressClickRef.current = true;
      track.scrollLeft = drag.startScrollLeft - delta;
    }
  };

  const stopMouseDrag = () => {
    dragRef.current.active = false;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const touch = event.touches[0];
    if (!track || !touch) return;
    dragRef.current = { active: true, startX: touch.clientX, startScrollLeft: track.scrollLeft, distance: 0 };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    const touch = event.touches[0];
    if (!drag.active || !track || !touch) return;
    const delta = touch.clientX - drag.startX;
    drag.distance = Math.abs(delta);
    if (drag.distance > 6) track.scrollLeft = drag.startScrollLeft - delta;
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return (
    <div className="relative group/slider">
      {canScrollLeft && <button type="button" aria-label="Trượt về trước" onClick={() => scrollByPage(-1)} className="absolute -left-3 top-[104px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition-all hover:border-[#da2527] hover:bg-[#da2527] hover:text-white sm:-left-4"><ChevronLeft size={20} aria-hidden="true" /></button>}
      {canScrollRight && <button type="button" aria-label="Trượt sang đề tiếp theo" onClick={() => scrollByPage(1)} className="absolute -right-3 top-[104px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition-all hover:border-[#da2527] hover:bg-[#da2527] hover:text-white sm:-right-4"><ChevronRight size={20} aria-hidden="true" /></button>}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopMouseDrag}
        onMouseLeave={stopMouseDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopMouseDrag}
        onClickCapture={handleClickCapture}
        className="flex cursor-grab select-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {exams.map((exam, index) => (
          <Link href={`/de-thi/${exam.slug}`} className="group block w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]" key={exam.slug}>
            <div className={`flex h-[17rem] items-center justify-center rounded-xl p-5 ${stageClasses[index % stageClasses.length]}`}>
              <ExamBookCover className="h-52 rounded-xl bg-transparent p-0" stageClassName="bg-transparent" level={exam.cefrLevel === 'C1' ? 'B2' : exam.cefrLevel} provider="osd" simulationNumber={testNumber(exam.slug)} title={displayTitle(exam)} />
            </div>
            <h4 className="mt-2.5 line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{displayTitle(exam)}</h4>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.sectionCount} phần thi · {exam.durationMinutes} phút · {exam.passPercentage ?? 60}% đạt</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50"><Play size={10} fill="currentColor" aria-hidden="true" /></span> Xem đề <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
