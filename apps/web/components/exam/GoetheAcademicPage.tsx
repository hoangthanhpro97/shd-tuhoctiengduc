'use client';

import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { buildGoetheBookSets } from '../../data/exam-book-sets';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { AuthModal } from '../auth/AuthModal';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';
import { ExamBookCover } from './ExamBookCover';
import { ExamBookSetCard } from './ExamBookSetCard';

function testNumber(slug: string) {
  return (slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01').padStart(2, '0');
}

function LevelHeading({ level, title, comingSoon = false }: { level: 'B1' | 'B2'; title: string; comingSoon?: boolean }) {
  return (
    <h3 className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <span className="rounded-md bg-[#16a34a] px-2.5 py-1 text-xs font-black text-white">{level}</span>
      <span className="text-lg font-extrabold text-slate-800">{title}</span>
      {comingSoon && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Sắp ra mắt</span>}
    </h3>
  );
}

function RecentGoetheExamItem({ exam }: { exam: PublicExamSummary }) {
  return (
    <Link href={`/de-thi/${exam.slug}`} className="group block">
      <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">Goethe {exam.cefrLevel} · Modellsatz {testNumber(exam.slug)}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.sectionCount} phần thi · {exam.durationMinutes} phút · {exam.passPercentage ?? 60}% đạt</p>
      <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527]">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#da2527]"><Play size={10} fill="currentColor" aria-hidden="true" /></span>
        Làm bài <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function GoetheB2PreviewCard() {
  const title = 'Goethe-Zertifikat B2';
  return (
    <article className="flex flex-col gap-2 rounded-2xl bg-slate-50/70 p-2 sm:flex-row">
      <div className="w-36 shrink-0 rounded-xl p-3 sm:w-40">
        <ExamBookCover className="h-44 rounded-xl p-2" level="B2" provider="goethe" simulationNumber="01" stageClassName="bg-emerald-100/80" title={title} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-2 pb-3 sm:py-3 sm:pr-4">
        <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Sắp ra mắt</span>
        <h4 className="mt-2 text-base font-extrabold text-slate-900">{title}</h4>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">Bộ đề mô phỏng Goethe-Zertifikat B2 đang được biên tập và hiệu đính đáp án chi tiết theo chuẩn khảo thí.</p>
        <Link href="/de-thi/osd#b2" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline">Luyện tạm đề ÖSD B2 <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

export function GoetheAcademicPage({ b1, b2 }: { b1: PublicExamSummary[]; b2: PublicExamSummary[] }) {
  const [authOpen, setAuthOpen] = useState(false);
  const b1BookSets = buildGoetheBookSets(b1);
  const b2BookSets = buildGoetheBookSets(b2);
  const recent = [...b1].slice(0, 6);

  return (
    <main className="bg-white">
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28">
        <TopAnnouncementBar placement="hero" />
        <h1 className="text-4xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[50px]">
          <span className="block">Luyện thi <span className="text-[#da2527]">Goethe</span> Online-Test</span>
          <span className="mt-1.5 block">miễn phí - SHD Tự Học Tiếng Đức</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Trọn bộ đề luyện thi mô phỏng Goethe-Zertifikat Lesen &amp; Hören được số hóa chuẩn xác.<br className="hidden sm:inline" /> Làm bài tính giờ thực tế, đối chiếu dẫn chứng verbatim và giải thích bẫy tư duy bằng tiếng Việt.
        </p>
        <button type="button" onClick={() => setAuthOpen(true)} aria-haspopup="dialog" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#da2527] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81e20]">
          Đăng ký miễn phí ngay
        </button>
      </header>

      {recent.length > 0 && (
        <section className="mx-auto mt-10 max-w-6xl px-4">
          <h2 className="mb-5 text-xl font-extrabold text-slate-900 sm:text-2xl">Bài test Goethe-Zertifikat mới cập nhật</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            {recent.map((exam) => <RecentGoetheExamItem exam={exam} key={exam.slug} />)}
          </div>
        </section>
      )}

      <nav className="mx-auto mt-12 mb-7 flex max-w-6xl flex-wrap items-center gap-2.5 px-4" aria-label="Phân loại cấp độ Goethe">
        <Link href="#goethe-exam-catalog" className="rounded-full border border-[#da2527] bg-[#da2527] px-4 py-2 text-xs font-bold text-white">Tất cả cấp độ</Link>
        <Link href="#b1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#16a34a] hover:text-[#16a34a]">Goethe B1 ({b1.length})</Link>
        <Link href="#b2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#16a34a] hover:text-[#16a34a]">Goethe B2 · Sắp ra mắt</Link>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 id="goethe-exam-catalog" className="mb-6 flex scroll-mt-24 items-center gap-3 border-b border-slate-200 pb-3 text-2xl font-extrabold text-slate-900">
          <span className="h-7 w-1.5 rounded-full bg-[#16a34a]" />
          Bài test từ Goethe-Zertifikat
        </h2>
        <section id="b1" className="scroll-mt-24">
          <LevelHeading level="B1" title="Goethe-Zertifikat B1 (Lesen & Hören)" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {b1BookSets.map((bookSet) => (
              <ExamBookSetCard
                key={bookSet.slug}
                bookSet={bookSet}
                exams={bookSet.examSlugs.map((slug) => b1.find((exam) => exam.slug === slug)).filter((exam): exam is PublicExamSummary => Boolean(exam))}
              />
            ))}
          </div>
        </section>
        <section id="b2" className="mt-10 scroll-mt-24">
          <LevelHeading level="B2" title="Goethe-Zertifikat B2" comingSoon={!b2BookSets.length} />
          {b2BookSets.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {b2BookSets.map((bookSet) => (
                <ExamBookSetCard
                  key={bookSet.slug}
                  bookSet={bookSet}
                  exams={bookSet.examSlugs.map((slug) => b2.find((exam) => exam.slug === slug)).filter((exam): exam is PublicExamSummary => Boolean(exam))}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><GoetheB2PreviewCard /></div>
          )}
        </section>
      </section>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
