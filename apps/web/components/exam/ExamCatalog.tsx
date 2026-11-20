'use client';

import { ArrowRight, BookOpenCheck, Clock3, Lightbulb, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';
import { ExamBookCover } from './ExamBookCover';
import { ExamBookSetCard } from './ExamBookSetCard';
import { RecentAttemptsSection } from './RecentAttemptsSection';
import { examBookSets, sourceExamSlug } from '../../data/exam-book-sets';
import { useAuth } from '../auth/AuthProvider';

export type PublicExamListItem = {
  examId: string;
  slug: string;
  title: string;
  providerFormat: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  durationMinutes: number;
  passPercentage: number;
  questionCount: number;
  sectionCount: number;
  provider: 'osd';
};

type PreviewProvider = 'goethe' | 'telc';

const levelOrder: Record<PublicExamListItem['cefrLevel'], number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const recentExamSlugs = [
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

function displayTitle(exam: PublicExamListItem) {
  return `ÖSD ${exam.cefrLevel} · Modelltest ${testNumber(exam.slug)}`;
}

function DolFeature({
  icon,
  iconClassName,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
}) {
  return (
    <article>
      <span className={`mb-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full ${iconClassName}`}>{icon}</span>
      <h3 className="mb-1 text-base font-extrabold text-slate-900 sm:text-lg">{title}</h3>
      <p className="max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">{description}</p>
    </article>
  );
}

function SectionHeading({ title, count, tone, trailing }: { title: string; count: string; tone: 'osd' | 'goethe' | 'telc'; trailing?: React.ReactNode }) {
  const accent = tone === 'osd' ? 'bg-[#0284c7]' : tone === 'goethe' ? 'bg-[#16a34a]' : 'bg-amber-500';
  const badge = tone === 'osd' ? 'bg-sky-50 text-[#0284c7]' : tone === 'goethe' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-7 w-1.5 shrink-0 rounded-full ${accent}`} />
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      </div>
      {trailing ?? <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${badge}`}>{count}</span>}
    </div>
  );
}

function LevelHeading({ level, title }: { level: 'B1' | 'B2'; title: string }) {
  return (
    <h3 className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <span className="rounded-md bg-[#0284c7] px-2.5 py-1 text-xs font-black text-white">{level}</span>
      <span className="text-lg font-extrabold text-slate-800">{title}</span>
    </h3>
  );
}

function RecentExamItem({ exam }: { exam: PublicExamListItem }) {
  return (
    <Link href={`/de-thi/${exam.slug}`} className="group block">
      <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{displayTitle(exam)}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.sectionCount} phần thi · {exam.durationMinutes} phút · {exam.passPercentage ?? 60}% đạt</p>
      <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527]">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#da2527]"><Play size={10} fill="currentColor" aria-hidden="true" /></span>
        Làm bài <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function PreviewCard({ provider, level }: { provider: PreviewProvider; level: 'B1' | 'B2' }) {
  const isGoethe = provider === 'goethe';
  const providerLabel = isGoethe ? 'Goethe-Zertifikat' : 'telc Deutsch';
  const title = `${providerLabel} ${level}`;
  const stageClassName = isGoethe ? 'bg-emerald-100/80' : 'bg-amber-100/80';

  return (
    <Link href={`/de-thi/${provider}#${level.toLowerCase()}`} className="group flex min-w-0 flex-col gap-2 rounded-2xl bg-slate-50/70 p-2 transition-colors hover:bg-rose-50/70 sm:flex-row">
      <div className="w-36 shrink-0 rounded-xl p-3 sm:w-40">
        <ExamBookCover className="h-44 rounded-xl p-2" level={level} provider={provider} simulationNumber="01" stageClassName={stageClassName} title={title} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-2 pb-3 sm:py-3 sm:pr-4">
        <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Sắp ra mắt</span>
        <h4 className="mt-2 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">{title}</h4>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">Bộ đề mô phỏng bám sát định dạng {providerLabel} {level}, tổ chức Lesen và Hören theo chuẩn khảo thí.</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">Đang hiệu đính lời giải chi tiết <ArrowRight size={13} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function ExamCatalog({ exams }: { exams: PublicExamListItem[] }) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const sorted = [...exams].sort((a, b) => levelOrder[a.cefrLevel] - levelOrder[b.cefrLevel] || Number(testNumber(a.slug)) - Number(testNumber(b.slug)));
  const b1 = sorted.filter((exam) => exam.cefrLevel === 'B1');
  const b2 = sorted.filter((exam) => exam.cefrLevel === 'B2');
  const examsBySlug = new Map(sorted.map((exam) => [exam.slug, exam]));
  const recentExams = recentExamSlugs.map((slug) => examsBySlug.get(slug)).filter((exam): exam is PublicExamListItem => Boolean(exam));

  return (
    <main className="exam-catalog-shd-page bg-white">
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-14 pt-24 text-center sm:pt-28">
        <TopAnnouncementBar placement="hero" />
        <h1 className="text-4xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
          <span className="block">Luyện thi <span className="text-[#da2527]">ÖSD &amp; Goethe</span></span>
          <span className="mt-1.5 block">Online-Test Miễn phí</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Kho đề thi mô phỏng bám sát cấu trúc viện khảo thí ÖSD, Goethe và telc.<br className="hidden sm:inline" /> Làm bài tính giờ thực tế, chấm điểm máy chủ và giải thích bẫy tư duy chi tiết bằng tiếng Việt.
        </p>
        <a href="https://shdeducation.vn" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#da2527] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81e20]">
          Tìm hiểu khoá học
        </a>
      </header>

      {!user && <section id="updated" className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4">
        <h2 className="mb-5 text-xl font-extrabold text-slate-900 sm:text-2xl">Bài test mới nhất</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          {recentExams.map((exam) => <RecentExamItem exam={exam} key={exam.slug} />)}
        </div>
      </section>}
      <RecentAttemptsSection exams={recentExams} />

      <section className="my-8 bg-gradient-to-b from-white via-[#fff5f5] to-white py-10 sm:my-10 sm:py-12" aria-labelledby="why-online-test">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-x-10 gap-y-7 px-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-x-12">
          <div className="relative">
            <h2 id="why-online-test" className="relative z-10 text-2xl font-black leading-[1.25] tracking-tight text-slate-900 sm:text-3xl lg:text-[32px]">
              <span className="block">Vì sao nên chọn làm</span>
              <span className="block sm:whitespace-nowrap">
                <span className="relative inline-block">
                  <span data-testid="usp-online-text" className="relative z-10 text-[#da2527]">ÖSD &amp; Goethe Online-Test</span>
                  <span aria-hidden="true" data-testid="usp-question-circle" className="pointer-events-none absolute left-[calc(100%-0.75rem)] top-1/2 z-0 h-14 w-14 -translate-y-1/2 rounded-full bg-[#da2527]/[0.08] sm:left-[calc(100%-0.75rem)] sm:h-20 sm:w-20" />
                  <span aria-hidden="true" data-testid="usp-question" className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 select-none text-5xl font-black leading-none text-[#da2527]/90 sm:left-[calc(100%+1.75rem)] sm:text-7xl">?</span>
                </span>
              </span>
              <span className="block">Tự Học Tiếng Đức</span>
            </h2>
          </div>
          <DolFeature icon={<BookOpenCheck size={21} />} iconClassName="bg-rose-100/80 text-[#da2527]" title="Đề thi ÖSD - Goethe mới nhất & nhiều nhất" description="Tổng hợp bộ đề luyện thi Lesen & Hören cập nhật liên tục theo chuẩn viện khảo thí ÖSD, Goethe và telc." />
          <DolFeature icon={<Clock3 size={21} />} iconClassName="bg-sky-100/80 text-[#0284c7]" title="Giao diện test như thi thật" description="Phòng thi chia đôi màn hình trực quan, tính giờ thực tế và thao tác mượt mà giúp bạn làm quen áp lực phòng thi." />
          <DolFeature icon={<Lightbulb size={21} />} iconClassName="bg-emerald-100/80 text-emerald-600" title="Giải thích bẫy tư duy và từ vựng chi tiết" description="Sau khi nộp bài có ngay đáp án, định vị dẫn chứng trong bài đọc/nghe và phân tích bẫy ngữ pháp, từ đồng nghĩa bằng tiếng Việt." />
        </div>
      </section>

      <section id="osd" className="mx-auto mt-14 max-w-6xl scroll-mt-24 px-4">
        <nav className="mb-7 flex flex-wrap items-center gap-2.5" aria-label="Lọc bộ đề thi">
          <Link href="#osd" className="rounded-full border border-[#da2527] bg-[#da2527] px-4 py-2 text-xs font-bold text-white">Tất cả ({sorted.length})</Link>
          <Link href="#osd-b1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD B1 ({b1.length})</Link>
          <Link href="#osd-b2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">ÖSD B2 ({b2.length})</Link>
          <Link href="#goethe" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">Goethe · Sắp ra mắt</Link>
          <Link href="#telc" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]">telc · Sắp ra mắt</Link>
        </nav>
        <SectionHeading
          title="Bài test từ ÖSD Zertifikat"
          count={`${sorted.length} đề chính thức`}
          tone="osd"
          trailing={<Link className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-colors hover:text-[#b81e20] sm:text-sm" href="/de-thi/osd"><span>Xem thêm</span><span className="transition-transform group-hover:translate-x-0.5">→</span></Link>}
        />
        <div id="osd-b1" className="scroll-mt-24">
          <LevelHeading level="B1" title="ÖSD Zertifikat B1 (ZB1)" />
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">{examBookSets.filter((set) => set.level === 'B1').map((bookSet) => <ExamBookSetCard key={bookSet.slug} bookSet={bookSet} exams={bookSet.examSlugs.map((slug) => b1.find((exam) => exam.slug === sourceExamSlug(slug))).filter((exam): exam is PublicExamListItem => Boolean(exam))} />)}</div>
        </div>
        <div id="osd-b2" className="mt-8 scroll-mt-24">
          <LevelHeading level="B2" title="ÖSD Zertifikat B2 (ZB2)" />
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">{examBookSets.filter((set) => set.level === 'B2').map((bookSet) => <ExamBookSetCard key={bookSet.slug} bookSet={bookSet} exams={bookSet.examSlugs.map((slug) => b2.find((exam) => exam.slug === sourceExamSlug(slug))).filter((exam): exam is PublicExamListItem => Boolean(exam))} />)}</div>
        </div>
      </section>

      <section id="goethe" className="mx-auto mt-12 max-w-6xl scroll-mt-24 px-4">
        <SectionHeading title="Bài test từ Goethe-Zertifikat" count="Sắp ra mắt" tone="goethe" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><PreviewCard provider="goethe" level="B1" /><PreviewCard provider="goethe" level="B2" /></div>
      </section>

      <section id="telc" className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4">
        <SectionHeading title="Bài test từ telc Deutsch" count="Sắp ra mắt" tone="telc" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><PreviewCard provider="telc" level="B1" /><PreviewCard provider="telc" level="B2" /></div>
      </section>

      <section className="mx-auto mt-14 mb-16 max-w-6xl px-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-rose-200/70 bg-[#fdf2f2] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Đăng ký tài khoản miễn phí</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">Lưu lịch sử làm bài thi thử, theo dõi tiến độ B1–B2 và mở khóa toàn bộ giải thích chi tiết.</p>
          </div>
          <button type="button" onClick={() => setAuthOpen(true)} aria-haspopup="dialog" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#da2527] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#b81e20]">Đăng ký miễn phí ngay</button>
        </div>
      </section>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
