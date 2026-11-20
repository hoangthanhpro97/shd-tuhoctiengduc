'use client';

import { ChevronLeft, ChevronRight, Mic2, PenLine, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { speakingProviderLabels, speakingTaskTypeLabels, speakingTasks } from '../../data/speaking-fixtures';
import { writingProviderLabels, writingTaskTypeLabels, writingTasks } from '../../data/writing-fixtures';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

type SampleSkill = 'speaking' | 'writing';

type SampleCardItem = {
  id: string;
  slug: string;
  href: string;
  skill: SampleSkill;
  title: string;
  level: 'B1' | 'B2';
  provider: 'Goethe' | 'ÖSD';
  providerLabel: string;
  partLabel: string;
  taskTypeLabel: string;
  minutes: number;
  searchText: string;
};

const pageSize = 9;

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/gu, 'd');
}

function buildSampleItems(): SampleCardItem[] {
  const speakingItems: SampleCardItem[] = speakingTasks.map((task) => {
    const provider = task.examProvider.startsWith('goethe') ? 'Goethe' : 'ÖSD';
    const providerLabel = speakingProviderLabels[task.examProvider];
    const taskTypeLabel = speakingTaskTypeLabels[task.taskType];
    const partLabel = `Teil ${task.part}`;
    return {
      id: `sp-${task.id}`,
      slug: task.slug,
      href: `/bai-mau-sprechen/${task.slug}`,
      skill: 'speaking',
      title: task.title,
      level: 'B1',
      provider,
      providerLabel,
      partLabel,
      taskTypeLabel,
      minutes: Math.max(1, Math.ceil(task.durationSeconds / 60)),
      searchText: normalizeText(`${task.title} ${task.topic} ${provider} ${providerLabel} ${partLabel} ${taskTypeLabel} sprechen noi`),
    };
  });

  const writingItems: SampleCardItem[] = writingTasks.map((task) => {
    const provider = task.examProvider.startsWith('goethe') ? 'Goethe' : 'ÖSD';
    const providerLabel = writingProviderLabels[task.examProvider];
    const taskTypeLabel = `${writingTaskTypeLabels[task.taskType]} · ${task.writingTarget.textTypeLabel}`;
    const level: 'B1' | 'B2' = task.level === 'B2' ? 'B2' : 'B1';
    return {
      id: `wr-${task.id}`,
      slug: task.slug,
      href: `/bai-mau-schreiben/${task.slug}`,
      skill: 'writing',
      title: task.title,
      level,
      provider,
      providerLabel,
      partLabel: task.partLabel,
      taskTypeLabel,
      minutes: Math.max(1, Math.ceil(task.durationSeconds / 60)),
      searchText: normalizeText(`${task.title} ${task.topic} ${provider} ${providerLabel} ${level} ${task.partLabel} ${taskTypeLabel} schreiben viet`),
    };
  });

  return [...speakingItems, ...writingItems];
}

const allSampleItems = buildSampleItems();

const levelOptions = [
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'A1', label: 'A1', note: 'Sắp ra mắt' },
  { value: 'A2', label: 'A2', note: 'Sắp ra mắt' },
] as const;

const providerOptions = [
  { value: 'ÖSD', label: 'ÖSD Zertifikat' },
  { value: 'Goethe', label: 'Goethe-Zertifikat' },
  { value: 'TELC', label: 'telc Deutsch', note: 'Sắp ra mắt' },
] as const;

export function ModelAnswersHub({ initialTab = 'speaking' }: { initialTab?: SampleSkill }) {
  const [tab, setTab] = useState<'all' | SampleSkill>(initialTab);
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const toggleValue = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setPage(1);
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const resetFilters = () => {
    setPage(1);
    setQuery('');
    setLevels([]);
    setProviders([]);
  };

  const filtered = useMemo(() => {
    const words = normalizeText(query).trim().split(/\s+/u).filter(Boolean);
    return allSampleItems.filter((item) => {
      if (tab !== 'all' && item.skill !== tab) return false;
      if (levels.length && !levels.includes(item.level)) return false;
      if (providers.length && !providers.includes(item.provider)) return false;
      if (words.length && !words.every((word) => item.searchText.includes(word))) return false;
      return true;
    });
  }, [tab, query, levels, providers]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = Boolean(query || levels.length || providers.length);

  const speakingCount = allSampleItems.filter((item) => item.skill === 'speaking').length;
  const writingCount = allSampleItems.filter((item) => item.skill === 'writing').length;

  return (
    <main className="bg-white">
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28">
        <TopAnnouncementBar placement="hero" />
        <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px]">
          <span className="block">
            Bài mẫu <span className="text-[#da2527]">Schreiben &amp; Sprechen</span>
          </span>
          <span className="mt-1.5 block font-normal text-[26px] sm:text-[44px] lg:text-[44px]">miễn phí - SHD Tự Học Tiếng Đức</span>
        </h1>
        <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Kho bài mẫu Sprechen &amp; Schreiben miễn phí, chuẩn cấu trúc đề thi Goethe và ÖSD trình độ từ B1 - B2 - C1.
          <br className="hidden sm:inline" /> Cung cấp dàn ý chi tiết, mẫu câu Redemittel ăn điểm và không gian thực hành trực tiếp.
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Kho Bài mẫu <span className="text-[#da2527]">{tab === 'speaking' ? 'Sprechen' : tab === 'writing' ? 'Schreiben' : 'Schreiben & Sprechen'}</span>
            </h2>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#da2527]">
              {filtered.length} bài mẫu
            </span>
          </div>

          <div
            className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50/80 p-1 sm:w-auto"
            role="tablist"
            aria-label="Kỹ năng bài mẫu"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'speaking'}
              onClick={() => { setTab('speaking'); setPage(1); }}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:flex-initial ${
                tab === 'speaking'
                  ? 'bg-[#da2527] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#da2527]'
              }`}
            >
              <Mic2 size={14} aria-hidden="true" />
              <span>Sprechen ({speakingCount})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'writing'}
              onClick={() => { setTab('writing'); setPage(1); }}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:flex-initial ${
                tab === 'writing'
                  ? 'bg-[#da2527] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#da2527]'
              }`}
            >
              <PenLine size={14} aria-hidden="true" />
              <span>Schreiben ({writingCount})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'all'}
              onClick={() => { setTab('all'); setPage(1); }}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:flex-initial ${
                tab === 'all'
                  ? 'bg-[#da2527] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#da2527]'
              }`}
            >
              <span>Tất cả ({allSampleItems.length})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
            <label className="relative block">
              <span className="sr-only">Tìm kiếm bài mẫu</span>
              <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => { setPage(1); setQuery(event.target.value); }}
                placeholder="Tìm chủ đề, dạng bài hoặc từ khóa"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-[#da2527]"
              />
            </label>

            <div className="mt-4 space-y-6 rounded-2xl border border-slate-200 bg-white p-5">
              <fieldset className="space-y-2.5">
                <legend className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">Trình độ CEFR</legend>
                <div className="grid gap-2">
                  {levelOptions.map((choice) => {
                    const isDisabled = 'note' in choice && Boolean(choice.note);
                    return (
                      <label key={choice.value} className={`flex items-center gap-2 text-sm ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>
                        <input
                          type="checkbox"
                          checked={levels.includes(choice.value)}
                          disabled={isDisabled}
                          onChange={() => toggleValue(setLevels, choice.value)}
                          className="h-4 w-4 rounded border-slate-300 accent-[#da2527]"
                        />
                        <span>{choice.label}</span>
                        {'note' in choice && <span className="text-[10px] text-slate-400">{choice.note}</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-2.5">
                <legend className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">Chuẩn khảo thí</legend>
                <div className="grid gap-2">
                  {providerOptions.map((choice) => {
                    const isDisabled = 'note' in choice && Boolean(choice.note);
                    return (
                      <label key={choice.value} className={`flex items-center gap-2 text-sm ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>
                        <input
                          type="checkbox"
                          checked={providers.includes(choice.value)}
                          disabled={isDisabled}
                          onChange={() => toggleValue(setProviders, choice.value)}
                          className="h-4 w-4 rounded border-slate-300 accent-[#da2527]"
                        />
                        <span>{choice.label}</span>
                        {'note' in choice && <span className="text-[10px] text-slate-400">{choice.note}</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] hover:underline"
                >
                  <RotateCcw size={13} aria-hidden="true" /> Đặt lại bộ lọc
                </button>
              )}
            </div>
          </aside>

          <div className="w-full min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="model-answers-grid">
              {visible.map((item) => (
                <Link key={item.id} href={item.href} className="group block min-w-0" title={item.title}>
                  <DynamicTopicThumbnail
                    skill={item.skill === 'speaking' ? 'sprechen' : 'schreiben'}
                    title={item.title}
                    itemKey={item.slug}
                    topLeftText={item.partLabel}
                    badgeText={`${item.provider} · ${item.level}`}
                  />
                  <h3 className="mt-2.5 line-clamp-2 min-h-[2.65rem] text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {item.taskTypeLabel} · {item.minutes} phút
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
                    <span>Xem bài mẫu →</span>
                  </div>
                </Link>
              ))}
            </div>

            {!visible.length && (
              <div role="status" className="rounded-2xl bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                Không tìm thấy bài mẫu phù hợp với bộ lọc hiện tại.
              </div>
            )}

            {pageCount > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Phân trang bài mẫu">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Trang trước"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((itemPage) => (
                  <button
                    key={itemPage}
                    type="button"
                    aria-current={itemPage === currentPage ? 'page' : undefined}
                    onClick={() => setPage(itemPage)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-bold ${
                      itemPage === currentPage
                        ? 'border-[#da2527] bg-[#da2527] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#da2527] hover:text-[#da2527]'
                    }`}
                  >
                    {itemPage}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Trang sau"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
