'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';
import { ExamBookCover } from './ExamBookCover';
import { ExamBookSetCard } from './ExamBookSetCard';
import { RecentAttemptsSection } from './RecentAttemptsSection';
import { examBookSets, sourceExamSlug } from '../../data/exam-book-sets';
import { useAuth } from '../auth/AuthProvider';

const recentSlugs = [
  'osd-b1-test-15',
  'osd-b2-test-10',
  'osd-b1-test-14',
  'osd-b2-test-09',
  'osd-b1-test-13',
  'osd-b2-test-08',
];

function testNumber(slug: string) {
  return (slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01').padStart(2, '0');
}

function displayTitle(exam: PublicExamSummary) {
  return `ÖSD ${exam.cefrLevel} · Modelltest ${testNumber(exam.slug)}`;
}

function RecentExamItem({ exam }: { exam: PublicExamSummary }) {
  return (
    <Link href={`/de-thi/${exam.slug}`} className="group block">
      <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{displayTitle(exam)}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.sectionCount} phần thi · {exam.durationMinutes} phút · {exam.passPercentage ?? 60}% đạt</p>
      <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527]"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50"><Play size={10} fill="currentColor" aria-hidden="true" /></span>Làm bài <span aria-hidden="true">→</span></span>
    </Link>
  );
}

function LevelHeading({ level, title, comingSoon = false }: { level: 'B1' | 'B2' | 'A1' | 'A2'; title: string; comingSoon?: boolean }) {
  return (
    <h3 className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <span className="rounded-md bg-[#0284c7] px-2.5 py-1 text-xs font-black text-white">{level}</span>
      <span className="text-lg font-extrabold text-slate-800">{title}</span>
      {comingSoon && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Sắp ra mắt</span>}
    </h3>
  );
}

function ComingSoonCard({ level }: { level: 'A1' | 'A2' }) {
  const title = `ÖSD Zertifikat ${level} (Z${level})`;
  return (
    <article className="flex flex-col gap-2 rounded-2xl bg-slate-50/70 p-2 sm:flex-row">
      <div className="w-36 shrink-0 rounded-xl p-3 sm:w-40">
        <ExamBookCover className="h-44 rounded-xl p-2" stageClassName="bg-sky-100/80" level={level} provider="osd" simulationNumber="01" title={title} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-2 pb-3 sm:py-3 sm:pr-4">
        <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Sắp ra mắt</span>
        <h4 className="mt-2 text-base font-extrabold text-slate-900">{title}</h4>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">Luyện Lesen &amp; Hören sơ cấp theo cấu trúc chuẩn Áo, giúp bạn xây nền tảng vững chắc cho kỳ thi ÖSD.</p>
        <span className="mt-3 text-xs font-bold text-emerald-600">Đang hiệu đính lời giải chi tiết</span>
      </div>
    </article>
  );
}

export function OsdAcademicPage({ b1, b2 }: { b1: PublicExamSummary[]; b2: PublicExamSummary[] }) {
  const { user } = useAuth();
  const recent = useMemo(() => {
    const bySlug = new Map([...b1, ...b2].map((exam) => [exam.slug, exam]));
    return recentSlugs.map((slug) => bySlug.get(slug)).filter((exam): exam is PublicExamSummary => Boolean(exam));
  }, [b1, b2]);

  return (
    <main className="bg-white">
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28">
        <TopAnnouncementBar placement="hero" />
        <h1 className="text-4xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
          Luyện thi <span className="text-[#da2527]">ÖSD Online-Test</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          <span className="block">Hệ thống đề thi mô phỏng chuẩn Viện Khảo thí ÖSD đầy đủ từ A1, A2, B1 và B2.</span>
          <span className="mt-1 block">Luyện tập Lesen và Hören theo cấu trúc thi thật, chấm điểm và giải thích tư duy chi tiết.</span>
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

      {!user && <section className="mx-auto mt-10 max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-extrabold text-slate-900 sm:text-2xl">Bài test mới nhất</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">{recent.map((exam) => <RecentExamItem exam={exam} key={exam.slug} />)}</div>
      </section>}
      <RecentAttemptsSection exams={recent.map((exam) => ({ ...exam, provider: 'osd' as const }))} />

      <nav className="mx-auto mt-12 mb-7 flex max-w-6xl flex-wrap items-center gap-2.5 px-4" aria-label="Phân loại cấp độ ÖSD">
        <Link href="#osd-catalog" className="rounded-full border border-[#da2527] bg-[#da2527] px-4 py-2 text-xs font-bold text-white">Tất cả cấp độ ({b1.length + b2.length})</Link>
        <Link href="#b1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD B1 ({b1.length})</Link>
        <Link href="#b2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD B2 ({b2.length})</Link>
        <Link href="#a1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD A1 · Sắp ra mắt</Link>
        <Link href="#a2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD A2 · Sắp ra mắt</Link>
      </nav>

      <section className="mx-auto max-w-6xl px-4">
        <h2 id="osd-catalog" className="mb-6 flex scroll-mt-24 items-center gap-3 border-b border-slate-200 pb-3 text-2xl font-extrabold text-slate-900"><span className="h-7 w-1.5 rounded-full bg-[#0284c7]" />Bài test từ ÖSD Zertifikat</h2>
        <section id="b1" className="scroll-mt-24"><LevelHeading level="B1" title="ÖSD Zertifikat B1 (ZB1)" /><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{examBookSets.filter((set) => set.level === 'B1').map((bookSet) => <ExamBookSetCard key={bookSet.slug} bookSet={bookSet} exams={bookSet.examSlugs.map((slug) => b1.find((exam) => exam.slug === sourceExamSlug(slug))).filter((exam): exam is PublicExamSummary => Boolean(exam))} />)}</div></section>
        <section id="b2" className="mt-10 scroll-mt-24"><LevelHeading level="B2" title="ÖSD Zertifikat B2 (ZB2)" /><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{examBookSets.filter((set) => set.level === 'B2').map((bookSet) => <ExamBookSetCard key={bookSet.slug} bookSet={bookSet} exams={bookSet.examSlugs.map((slug) => b2.find((exam) => exam.slug === sourceExamSlug(slug))).filter((exam): exam is PublicExamSummary => Boolean(exam))} />)}</div></section>
        <section id="a1" className="mt-10 scroll-mt-24"><LevelHeading level="A1" title="ÖSD Zertifikat A1 (ZA1)" comingSoon /><ComingSoonCard level="A1" /></section>
        <section id="a2" className="mt-10 mb-16 scroll-mt-24"><LevelHeading level="A2" title="ÖSD Zertifikat A2 (ZA2)" comingSoon /><ComingSoonCard level="A2" /></section>
      </section>
    </main>
  );
}
