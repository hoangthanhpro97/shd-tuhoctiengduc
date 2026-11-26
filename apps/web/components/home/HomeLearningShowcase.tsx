'use client';

import { ArrowRight, BookOpenCheck, Headphones, Mic, PenLine } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import type { HomeData } from '../../data/access';
import { importedDiktatPackages } from '../../data/diktat-imported';
import { buildGoetheBookSets, examBookSets } from '../../data/exam-book-sets';
import type { Exam } from '../../data/fixtures';
import { diktatExercises } from '../../data/learning-fixtures';
import { ExamBookCover } from '../exam/ExamBookCover';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';
import { BookArtCover, type RealGermanBookId } from './BookArtCover';
import { FloatingBooksBackground } from './FloatingBooksBackground';
import { RevealOnScroll } from './RevealOnScroll';

export type AttemptSummaryItem = {
  attemptId: string;
  slug: string;
  title: string;
  status: 'in_progress' | 'submitted' | 'graded';
  mode: 'exam' | 'practice';
  answeredCount: number;
  totalQuestions: number;
};

type SpeakingItem = { title: string; provider: string; part: string; itemKey: string; href: string };
type WritingItem = { title: string; provider: string; part: string; itemKey: string; href: string };

const homepageListeningKeys = ['thong-bao-nha-ga', 'mot-ngay-di-lam', 'hen-gap-cuoi-tuan', 'lop-hoc-buoi-toi'];
const homepageReadingKeys = ['lich-hoc-cua-ban', 'thong-tin-tuyen-dung', 'loi-moi', 'tin-nhan-trong-ngay'];

function examProvider(exam: Exam): 'goethe' | 'osd' | 'telc' {
  const value = `${exam.providerFormat ?? ''} ${exam.slug} ${exam.title}`.toLowerCase();
  if (value.includes('goethe')) return 'goethe';
  if (value.includes('telc')) return 'telc';
  return 'osd';
}

/* ================= ĐỀ THI ÖSD, GOETHE & TELC — MODERN OPEN LIBRARY ================= */
export function ProviderExamShowcase({ exams }: { exams: Exam[] }) {
  const [providerTab, setProviderTab] = useState<'all' | 'osd' | 'goethe' | 'telc'>('all');
  const libraryRef = useRef<HTMLElement>(null);

  const goetheB1Exams = useMemo(
    () => exams.filter((e) => examProvider(e) === 'goethe' && e.level === 'B1'),
    [exams],
  );
  const goetheBookSets = useMemo(() => {
    const dynamic = buildGoetheBookSets(goetheB1Exams);
    if (dynamic.length > 0) return dynamic;
    return [
      {
        slug: 'goethe-b1-tap-1',
        provider: 'goethe' as const,
        level: 'B1' as const,
        code: 'B1' as const,
        volumeNumber: '01',
        shortTitle: 'B1 · Tập 1',
        title: 'Goethe-Zertifikat B1 · Tập 1',
        description: 'Bộ 4 đề luyện thi Goethe-Zertifikat B1 (Modellsatz 01–04).',
        examSlugs: [],
      },
      {
        slug: 'goethe-b1-tap-2',
        provider: 'goethe' as const,
        level: 'B1' as const,
        code: 'B1' as const,
        volumeNumber: '02',
        shortTitle: 'B1 · Tập 2',
        title: 'Goethe-Zertifikat B1 · Tập 2',
        description: 'Bộ 4 đề luyện thi Goethe-Zertifikat B1 (Modellsatz 05–08).',
        examSlugs: [],
      },
    ];
  }, [goetheB1Exams]);

  const cards = useMemo(() => {
    const osdItems = [
      { ...examBookSets[0], tag: 'ÖSD · B1', tagColor: 'text-[#0284c7]' },
      { ...examBookSets[1], tag: 'ÖSD · B1', tagColor: 'text-[#0284c7]' },
      { ...examBookSets[4], tag: 'ÖSD · B2', tagColor: 'text-[#da2527]' },
    ];
    const goetheItems = goetheBookSets.slice(0, 3).map((set) => ({
      ...set,
      tag: 'Goethe · B1',
      tagColor: 'text-emerald-700',
    }));

    if (providerTab === 'osd') return osdItems;
    if (providerTab === 'goethe') return goetheItems;
    if (providerTab === 'telc') return [];
    return [osdItems[0], goetheItems[0], osdItems[2], goetheItems[1] ?? osdItems[1]].filter(Boolean);
  }, [goetheBookSets, providerTab]);

  return (
    <section
      ref={libraryRef}
      id="exams"
      className="shd-fb-scene relative overflow-hidden border-t border-slate-200/75 bg-white py-14 sm:py-16"
      aria-labelledby="provider-showcase-heading"
    >
      {/* Gentle 3-Plane Interactive Books Framing Left & Right Margins */}
      <FloatingBooksBackground sceneRef={libraryRef} variant="library" />

      <div className="shd-fb-content mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-9 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end">
            <h2 id="provider-showcase-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Đề thi <span className="text-[#da2527]">ÖSD, Goethe &amp; TELC</span>
            </h2>

            <div className="flex flex-wrap items-center gap-5" role="tablist" aria-label="Lọc theo chứng chỉ">
              {([
                { key: 'all', label: 'Nổi bật' },
                { key: 'osd', label: 'ÖSD Zertifikat' },
                { key: 'goethe', label: 'Goethe-Zertifikat' },
                { key: 'telc', label: 'telc Deutsch' },
              ] as const).map((tab) => {
                const active = providerTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setProviderTab(tab.key)}
                    className={`border-b-2 pb-1.5 text-xs font-bold transition-colors sm:text-[13px] ${
                      active
                        ? 'border-[#da2527] text-[#da2527]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <Link
                href={providerTab === 'goethe' ? '/de-thi/goethe' : providerTab === 'telc' ? '/de-thi/telc' : providerTab === 'osd' ? '/de-thi/osd' : '/de-thi'}
                className="inline-flex items-center gap-1 pb-1.5 text-xs font-bold text-[#da2527] hover:underline"
              >
                Xem tất cả <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {providerTab === 'telc' ? (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {(['B1', 'B2'] as const).map((lvl) => (
                <Link
                  key={lvl}
                  href={`/de-thi/telc#${lvl.toLowerCase()}`}
                  className="group flex flex-col items-center gap-6 sm:flex-row"
                >
                  <div className="w-48 shrink-0 transition-transform duration-300 group-hover:[transform:perspective(800px)_rotateY(-6deg)_translateY(-4px)]">
                    <ExamBookCover
                      level={lvl}
                      provider="telc"
                      simulationNumber="01"
                      title={`telc Deutsch ${lvl}`}
                      stageClassName="bg-[#f8f6f5] rounded-xl"
                      eager
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      TELC · {lvl}
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                      telc Deutsch {lvl}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Bộ đề mô phỏng chuẩn telc Deutsch {lvl} (Leseverstehen, Sprachbausteine &amp; Hörverstehen) đang được hiệu đính học thuật.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#da2527]">
                      Xem lộ trình telc <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((book) => (
                <Link
                  key={book.slug}
                  href={`/de-thi/${book.slug}`}
                  className="group flex flex-col"
                >
                  <div className="transition-transform duration-300 group-hover:[transform:perspective(900px)_rotateY(-5deg)_translateY(-3px)]">
                    <ExamBookCover
                      level={book.level}
                      provider={book.provider}
                      simulationNumber={book.volumeNumber}
                      title={book.title}
                      stageClassName="bg-[#f6f7f9] rounded-xl"
                      eager
                    />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col justify-between px-0.5">
                    <div>
                      <span className={`text-[11px] font-bold ${book.tagColor}`}>
                        {book.tag}
                      </span>
                      <h3 className="mt-1 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                        {book.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {book.description}
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5">
                      <span>Mở bộ đề</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ================= LUYỆN HÖREN & LESEN — EDITORIAL FEATURED + CLEAN STACK ================= */
export function SkillSpotlightSection({ data }: { data: HomeData | null }) {
  const [activeSkill, setActiveSkill] = useState<'listening' | 'reading'>('listening');

  const items = useMemo(() => {
    if (!data) return [];
    const pool = activeSkill === 'listening' ? data.listening : data.reading;
    const goetheFirst = pool.filter((i) => (i.provider ?? '').toLowerCase().includes('goethe')).slice(0, 2);
    const osdFirst = pool.filter((i) => !(i.provider ?? '').toLowerCase().includes('goethe')).slice(0, 2);
    const combined = [...goetheFirst, ...osdFirst];
    return (combined.length >= 4 ? combined : pool).slice(0, 4);
  }, [activeSkill, data]);

  const featured = items[0];
  const rest = items.slice(1, 4);
  const keyPool = activeSkill === 'listening' ? homepageListeningKeys : homepageReadingKeys;
  const routeBase = activeSkill === 'listening' ? '/luyen-nghe' : '/luyen-doc';
  const skillMode: 'horen' | 'lesen' = activeSkill === 'listening' ? 'horen' : 'lesen';

  return (
    <section
      id={activeSkill === 'listening' ? 'listening' : 'reading'}
      className="mx-auto max-w-7xl border-t border-slate-200/75 px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      aria-labelledby="skill-spotlight-heading"
    >
      <div id={activeSkill === 'listening' ? 'reading' : 'listening'} />
      <RevealOnScroll>
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end">
          <h2 id="skill-spotlight-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Luyện <span className="text-[#da2527]">Hören &amp; Lesen</span> chuyên sâu
          </h2>

          <div className="flex flex-wrap items-center gap-5">
            <div className="inline-flex items-center gap-4" role="tablist" aria-label="Chọn kỹ năng luyện tập">
              <button
                type="button"
                role="tab"
                aria-selected={activeSkill === 'listening'}
                onClick={() => setActiveSkill('listening')}
                className={`inline-flex items-center gap-1.5 border-b-2 pb-1.5 text-xs font-bold transition-colors sm:text-[13px] ${
                  activeSkill === 'listening'
                    ? 'border-[#da2527] text-[#da2527]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Headphones size={14} aria-hidden="true" />
                <span>Luyện Hören</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSkill === 'reading'}
                onClick={() => setActiveSkill('reading')}
                className={`inline-flex items-center gap-1.5 border-b-2 pb-1.5 text-xs font-bold transition-colors sm:text-[13px] ${
                  activeSkill === 'reading'
                    ? 'border-[#da2527] text-[#da2527]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpenCheck size={14} aria-hidden="true" />
                <span>Luyện Lesen</span>
              </button>
            </div>

            <Link href={routeBase} className="inline-flex items-center gap-1 pb-1.5 text-xs font-bold text-[#da2527] hover:underline">
              <span>Xem tất cả</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {!data || !featured ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="h-72 animate-pulse rounded-xl bg-slate-100 lg:col-span-5" />
            <div className="space-y-4 lg:col-span-7">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse border-b border-slate-200/80" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Featured Spotlight directly on white background (zero container card) */}
            <Link
              href={featured.slug ? `${routeBase}/${featured.slug}` : routeBase}
              className="group flex flex-col lg:col-span-5"
            >
              <DynamicTopicThumbnail
                skill={skillMode}
                title={featured.title}
                itemKey={featured.slug ?? keyPool[0]}
                badgeText={`${featured.provider ?? 'B1'} · Teil ${featured.teil}`}
                topLeftText={featured.level ?? 'B1'}
                eager
                flat
              />
              <div className="mt-4">
                <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527] sm:text-xl">
                  {featured.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {activeSkill === 'listening'
                    ? 'Luyện nghe kèm audio phân đoạn, transcript song ngữ Đức – Việt và giải thích bẫy tư duy chi tiết.'
                    : 'Đọc văn bản học thuật, định vị dẫn chứng verbatim trực tiếp và trau dồi từ vựng trọng tâm.'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3">
                <span className="text-xs font-semibold text-slate-500">
                  {featured.provider ?? 'SHD'} · {featured.level ?? 'B1'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                  Làm bài ngay <ArrowRight size={13} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Stacked Editorial List separated cleanly by thin 1px dividers */}
            <div className="divide-y divide-slate-200/85 border-y border-slate-200/85 lg:col-span-7">
              {rest.map((item, idx) => (
                <Link
                  key={item.slug ?? item.title}
                  href={item.slug ? `${routeBase}/${item.slug}` : routeBase}
                  className="group flex items-center gap-4 py-4 transition-colors first:pt-4 last:pb-4"
                >
                  <div className="w-28 shrink-0 sm:w-36">
                    <DynamicTopicThumbnail
                      skill={skillMode}
                      title={item.title}
                      itemKey={item.slug ?? keyPool[(idx + 1) % keyPool.length]}
                      badgeText={`Teil ${item.teil}`}
                      eager
                      flat
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="uppercase tracking-wider text-slate-700">
                        {item.provider ?? 'ÖSD'} · {item.level ?? 'B1'}
                      </span>
                      <span className="text-slate-400">· Teil {item.teil}</span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527] sm:text-base">
                      {item.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                      Luyện ngay <ArrowRight size={12} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </RevealOnScroll>
    </section>
  );
}

/* ================= SCHREIBEN & SPRECHEN — FLAT LIST WITH LIGHT DIVIDERS ================= */
export function ProductiveAtelierSection({
  speakingCards,
  writingCards,
}: {
  speakingCards: SpeakingItem[];
  writingCards: WritingItem[];
}) {
  return (
    <section
      id="speaking"
      className="mx-auto max-w-7xl border-t border-slate-200/75 px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      aria-labelledby="productive-atelier-heading"
    >
      <div id="writing">
        <RevealOnScroll>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 id="productive-atelier-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Bài mẫu <span className="text-[#da2527]">Schreiben &amp; Sprechen</span>
            </h2>
            <Link href="/bai-mau" className="inline-flex items-center gap-1 text-xs font-bold text-[#da2527] hover:underline sm:text-sm">
              <span>Khám phá toàn bộ kho bài mẫu</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Sprechen Flat Editorial Column */}
            <div className="border-t-2 border-slate-900 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-[#da2527]">
                    <Mic size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Luyện nói · Sprechen</h3>
                    <p className="text-xs text-slate-500">Hội thoại nhập vai, thuyết trình &amp; Redemittel</p>
                  </div>
                </div>
                <Link href="/bai-mau-sprechen" className="text-xs font-bold text-[#da2527] hover:underline">
                  Tất cả →
                </Link>
              </div>

              <div className="divide-y divide-slate-200/80 border-t border-slate-200/80">
                {speakingCards.slice(0, 4).map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="w-24 shrink-0">
                      <DynamicTopicThumbnail
                        skill="sprechen"
                        title={card.title}
                        itemKey={card.itemKey}
                        badgeText={card.part}
                        eager
                        flat
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {card.provider}
                      </span>
                      <h4 className="mt-0.5 truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">
                        {card.title}
                      </h4>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#da2527]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Schreiben Flat Editorial Column */}
            <div className="border-t-2 border-slate-900 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#0284c7]">
                    <PenLine size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Luyện viết · Schreiben</h3>
                    <p className="text-xs text-slate-500">Email trang trọng, diễn đàn &amp; dàn ý triển khai</p>
                  </div>
                </div>
                <Link href="/bai-mau-schreiben" className="text-xs font-bold text-[#da2527] hover:underline">
                  Tất cả →
                </Link>
              </div>

              <div className="divide-y divide-slate-200/80 border-t border-slate-200/80">
                {writingCards.slice(0, 4).map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="w-24 shrink-0">
                      <DynamicTopicThumbnail
                        skill="schreiben"
                        title={card.title}
                        itemKey={card.itemKey}
                        badgeText={card.part}
                        eager
                        flat
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {card.provider}
                      </span>
                      <h4 className="mt-0.5 truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">
                        {card.title}
                      </h4>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#da2527]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ================= DIKTAT — ZERO NESTED CARDS ON PURE WHITE ================= */
export function DiktatStudioSection() {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'B1' | 'A2' | 'A1'>('ALL');

  const allPackages = useMemo(() => {
    const b1Items = importedDiktatPackages.map((pkg) => ({
      slug: pkg.slug,
      title: pkg.title,
      subtitle: pkg.subtitle,
      level: pkg.level,
      questionCount: pkg.questionCount,
      keyForThumb: pkg.slug,
    }));
    const starterItems = diktatExercises.map((d) => ({
      slug: d.slug,
      title: d.title,
      subtitle:
        d.slug === 'diktat-a1-im-alltag'
          ? 'Giao tiếp & sinh hoạt hằng ngày'
          : d.slug === 'diktat-a2-am-arbeitsplatz'
            ? 'Môi trường công sở & trao đổi công việc'
            : 'Thói quen học tập & phát triển bản thân',
      level: d.level,
      questionCount: d.questions,
      keyForThumb: d.slug.replace(/^diktat-[ab]\d-/u, ''),
    }));
    return [...starterItems, ...b1Items];
  }, []);

  const visiblePackages = useMemo(() => {
    const filtered = levelFilter === 'ALL' ? allPackages : allPackages.filter((pkg) => pkg.level === levelFilter);
    return filtered.slice(0, 3);
  }, [allPackages, levelFilter]);

  return (
    <section
      id="dictation"
      className="border-t border-slate-200/75 bg-white py-14 sm:py-16"
      aria-labelledby="diktat-studio-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end">
            <h2 id="diktat-studio-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Nghe chép chính tả <span className="text-[#da2527]">Diktat</span>
            </h2>

            <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
              {(['ALL', 'B1', 'A2', 'A1'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`whitespace-nowrap border-b-2 pb-1 text-xs font-bold transition-colors ${
                    levelFilter === lvl
                      ? 'border-[#da2527] text-[#da2527]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'ALL' ? `Tất cả (${allPackages.length})` : `Trình độ ${lvl}`}
                </button>
              ))}
              <Link href="/chep-chinh-ta" className="ml-1 inline-flex shrink-0 items-center gap-1 whitespace-nowrap pb-1 text-xs font-bold text-[#da2527] hover:underline">
                Mở kho Diktat <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {visiblePackages.map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/chep-chinh-ta/${pkg.slug}`}
                className="group flex flex-col"
              >
                <DynamicTopicThumbnail
                  skill="diktat"
                  title={pkg.title}
                  itemKey={pkg.keyForThumb}
                  topLeftText={`${pkg.questionCount} câu`}
                  badgeText={`Diktat · ${pkg.level}`}
                  eager
                  flat
                />
                <h3 className="mt-3.5 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                  {pkg.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {pkg.subtitle}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                  Bắt đầu chép câu <ArrowRight size={13} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

const cefrRoadmapTiers: Array<{
  level: 'A1' | 'A2' | 'B1' | 'B2';
  bookId: RealGermanBookId;
  headline: string;
  focus: string;
  href: string;
  cta: string;
  accentColor: string;
}> = [
  {
    level: 'A1',
    bookId: 'menschen-a1',
    headline: 'Nền tảng sơ cấp',
    focus: 'Phát âm chuẩn, từ vựng sinh hoạt hằng ngày, mẫu câu ngắn & Diktat phản xạ khởi đầu.',
    href: '/de-thi/a1-a2',
    cta: 'Khám phá lộ trình A1',
    accentColor: 'text-[#da2527]',
  },
  {
    level: 'A2',
    bookId: 'schritte-a2',
    headline: 'Giao tiếp vững chắc',
    focus: 'Hội thoại công sở, đọc hiểu bản tin ngắn & làm quen cấu trúc đề thi Goethe / ÖSD A2.',
    href: '/de-thi/a1-a2',
    cta: 'Khám phá lộ trình A2',
    accentColor: 'text-amber-700',
  },
  {
    level: 'B1',
    bookId: 'netzwerk-b1',
    headline: 'Trọng tâm thi chứng chỉ',
    focus: 'Trọn bộ đề mô phỏng ÖSD B1 & Goethe-Zertifikat B1 (Lesen · Hören) kèm 11 bộ Diktat B1.',
    href: '/de-thi/goethe#b1',
    cta: 'Luyện bộ đề B1 ngay',
    accentColor: 'text-emerald-700',
  },
  {
    level: 'B2',
    bookId: 'goethe-b2-erfolg',
    headline: 'Học thuật & Du học',
    focus: 'Luyện 10 đề chuẩn ÖSD B2, bài viết lập luận chuyên sâu & kỹ năng phản biện học thuật.',
    href: '/de-thi/osd#b2',
    cta: 'Luyện bộ đề B2 ngay',
    accentColor: 'text-[#0284c7]',
  },
];

/* ================= LỘ TRÌNH CEFR A1–B2 — NATURAL BOOK DISPLAY ================= */
export function CefrLevelRoadmapSection() {
  return (
    <section
      className="mx-auto max-w-7xl border-t border-slate-200/75 px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      aria-labelledby="cefr-roadmap-heading"
    >
      <RevealOnScroll>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 id="cefr-roadmap-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Lộ trình học theo chuẩn <span className="text-[#da2527]">CEFR A1 – B2</span>
          </h2>
          <p className="max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
            Đồng bộ giáo trình quốc tế và kho đề thi chính thức cho từng nấc thang mục tiêu của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cefrRoadmapTiers.map((tier) => (
            <Link key={tier.level} href={tier.href} className="group flex flex-col">
              {/* Minimal light shelf stage ONLY behind the physical book cover */}
              <div className="flex items-center justify-center rounded-xl bg-[#f6f7f9] py-6 transition-colors group-hover:bg-[#eff1f5]">
                <div className="transition-transform duration-300 group-hover:[transform:perspective(900px)_rotateY(-7deg)_translateY(-5px)]">
                  <BookArtCover item={{ kind: 'textbook', bookId: tier.bookId }} compact />
                </div>
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-between px-0.5">
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-[0.14em] ${tier.accentColor}`}>
                    Trình độ {tier.level}
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                    {tier.headline}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {tier.focus}
                  </p>
                </div>

                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                  {tier.cta} <ArrowRight size={12} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
