'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { SkillExercise } from '../../lib/server/exam-content-loader';
import { getSkillExerciseTitle } from '../../lib/skill-catalog';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

function topicSkill(skill: SkillExercise['skill']) {
  return skill === 'Hoeren' ? 'horen' : 'lesen';
}

export function SkillProviderCarouselRow({ items }: { items: SkillExercise[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, distance: 0 });
  const suppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const update = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => { track.removeEventListener('scroll', update); observer.disconnect(); };
  }, [items.length]);
  const dragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !trackRef.current) return;
    dragRef.current = { active: true, startX: event.clientX, startScrollLeft: trackRef.current.scrollLeft, distance: 0 };
    suppressClickRef.current = false;
  };
  const dragMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag.active || !track) return;
    const delta = event.clientX - drag.startX;
    drag.distance = Math.abs(delta);
    if (drag.distance > 6) { event.preventDefault(); suppressClickRef.current = true; track.scrollLeft = drag.startScrollLeft - delta; }
  };
  const touchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch || !trackRef.current) return;
    dragRef.current = { active: true, startX: touch.clientX, startScrollLeft: trackRef.current.scrollLeft, distance: 0 };
  };
  const touchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const drag = dragRef.current;
    if (!touch || !drag.active || !trackRef.current) return;
    const delta = touch.clientX - drag.startX;
    drag.distance = Math.abs(delta);
    if (drag.distance > 6) trackRef.current.scrollLeft = drag.startScrollLeft - delta;
  };
  const scrollPage = (direction: -1 | 1) => trackRef.current?.scrollBy({ left: direction * (trackRef.current?.clientWidth ?? 0), behavior: 'smooth' });
  return <div className="relative group/slider">
    {canScrollLeft && <button type="button" aria-label="Bài trước" onClick={() => scrollPage(-1)} className="absolute -left-3 top-[104px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition-all hover:border-[#da2527] hover:bg-[#da2527] hover:text-white sm:-left-4"><ChevronLeft size={20} /></button>}
    {canScrollRight && <button type="button" aria-label="Bài tiếp theo" onClick={() => scrollPage(1)} className="absolute -right-3 top-[104px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition-all hover:border-[#da2527] hover:bg-[#da2527] hover:text-white sm:-right-4"><ChevronRight size={20} /></button>}
    <div ref={trackRef} onMouseDown={dragStart} onMouseMove={dragMove} onMouseUp={() => { dragRef.current.active = false; }} onMouseLeave={() => { dragRef.current.active = false; }} onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={() => { dragRef.current.active = false; }} onClickCapture={(event) => { if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; } }} className="flex cursor-grab select-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const title = getSkillExerciseTitle(item);
        const base = item.skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc';
        return <Link href={`/${base}/${item.slug}`} className="group block w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]" key={item.slug} title={title}>
          <DynamicTopicThumbnail skill={topicSkill(item.skill)} title={title} itemKey={item.slug} topLeftText={`${item.questions} câu`} badgeText={`${item.provider} · ${item.level}`} />
          <h4 className="mt-2.5 line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{title}</h4>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.questions} câu · {item.durationMinutes} phút · {item.provider} {item.level}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>Làm bài →</span>
        </Link>;
      })}
    </div>
  </div>;
}
