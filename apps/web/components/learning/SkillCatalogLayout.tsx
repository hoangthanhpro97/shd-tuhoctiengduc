'use client';

import { useState } from 'react';
import type { LearningSkill } from '../../data/deep-learning-fixtures';
import type { SkillExercise } from '../../lib/server/exam-content-loader';
import { matchesSkillExercise, type SkillFilters } from '../../lib/skill-catalog';
import { AuthModal } from '../auth/AuthModal';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';
import { SkillExerciseCard } from './SkillExerciseCard';
import { SkillFilterSidebar } from './SkillFilterSidebar';
import { SkillPagination } from './SkillPagination';

const pageSize = 9;

export function SkillCatalogLayout({ skill, exercises }: { skill: LearningSkill; exercises: SkillExercise[] }) {
  const isReading = skill === 'Lesen';
  const label = isReading ? 'Lesen' : 'Hören';
  const vietnameseLabel = isReading ? 'đọc' : 'nghe';
  const [filters, setFilters] = useState<SkillFilters>({ query: '', levels: [], providers: [], teils: [] });
  const [page, setPage] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);
  const filtered = exercises.filter((exercise) => matchesSkillExercise(exercise, filters));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const toggle = (group: 'level' | 'provider' | 'teil', value: string) => {
    setPage(1);
    setFilters((current) => {
      const key = group === 'level' ? 'levels' : group === 'provider' ? 'providers' : 'teils';
      const next = current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value];
      return { ...current, [key]: next };
    });
  };
  return <main className="bg-white">
    <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28">
      <TopAnnouncementBar placement="hero" />
      <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px]">
        <span className="block">
          Luyện <span className="text-[#da2527]">{label}</span> chuẩn Goethe &amp; ÖSD
        </span>
        <span className="mt-1.5 block font-normal text-[26px] sm:text-[44px] lg:text-[44px]">
          miễn phí - SHD Tự Học Tiếng Đức
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
        {isReading ? (
          <>
            Luyện Goethe &amp; ÖSD Modelltests Lesen miễn phí với nguồn đề sát với đề thi thực tế
            <br />
            kèm answer key, giải thích chi tiết, từ vựng đi kèm và trải nghiệm làm bài
            <br />
            thi thử như trên máy.
          </>
        ) : (
          <>
            Goethe &amp; ÖSD Modelltests Hören miễn phí tại SHD Tự Học Tiếng Đức
            <br />
            đề thi, audio, transcript, answer key, giải thích chi tiết từ vựng
            <br />
            đi kèm và trải nghiệm làm bài thi thử như trên máy.
          </>
        )}
      </p>
      <a
        href="https://shdeducation.vn"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#da2527] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81e20]"
      >
        Tìm hiểu khoá học
      </a>
    </header>
    <section className="mx-auto mt-10 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Goethe &amp; ÖSD Zertifikat Modelltests <span className="text-[#da2527]">{label}</span></h2>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#da2527]">{filtered.length} bài luyện</span>
      </div>
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <SkillFilterSidebar skill={skill} filters={filters} onQueryChange={(query) => { setPage(1); setFilters((current) => ({ ...current, query })); }} onToggle={toggle} onReset={() => { setPage(1); setFilters({ query: '', levels: [], providers: [], teils: [] }); }} />
        <div className="w-full min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="skill-exercise-grid">{visible.map((exercise) => <SkillExerciseCard exercise={exercise} key={exercise.slug} />)}</div>
          {!visible.length && <div role="status" className="rounded-2xl bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">Không tìm thấy bài luyện {vietnameseLabel} phù hợp.</div>}
          <SkillPagination skill={skill} page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </section>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </main>;
}
