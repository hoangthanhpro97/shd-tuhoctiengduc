'use client';

import { RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { importedDiktatPackages } from '../../data/diktat-imported';
import { diktatExercises } from '../../data/learning-fixtures';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

const levelOptions = [
  { value: 'B1', label: 'B1' },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B2', label: 'B2', note: 'Sắp ra mắt' },
] as const;

const modeOptions = [
  { value: 'diktat', label: 'Chép chính tả (Diktat)' },
  { value: 'shadowing', label: 'Nhại giọng (Shadowing)' },
  { value: 'vocabulary', label: 'Luyện phát âm từ vựng' },
] as const;

const combinedExercises = [
  ...importedDiktatPackages.map((pkg) => ({
    slug: pkg.slug,
    title: pkg.title,
    level: pkg.level,
    questions: pkg.questionCount,
    duration: `${String(Math.ceil(pkg.questionCount * 0.75)).padStart(2, '0')}:00`,
    subtitle: pkg.subtitle,
  })),
  ...diktatExercises.map((d) => ({
    slug: d.slug,
    title: d.title,
    level: d.level,
    questions: d.questions,
    duration: d.duration,
    subtitle: d.slug === 'diktat-a1-im-alltag'
      ? 'Giao tiếp & sinh hoạt hằng ngày'
      : d.slug === 'diktat-a2-am-arbeitsplatz'
        ? 'Môi trường công sở & trao đổi công việc'
        : 'Thói quen học tập & phát triển bản thân',
  })),
];

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/gu, 'd');
}

export function DiktatCatalogView() {
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);

  const toggleValue = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const resetFilters = () => {
    setQuery('');
    setLevels([]);
    setModes([]);
  };

  const filtered = useMemo(() => {
    const words = normalizeText(query).trim().split(/\s+/u).filter(Boolean);
    return combinedExercises.filter((item) => {
      if (levels.length && !levels.includes(item.level)) return false;
      const haystack = normalizeText(`${item.title} ${item.level} ${item.subtitle ?? ''} ${item.slug}`);
      if (words.length && !words.every((word) => haystack.includes(word))) return false;
      return true;
    });
  }, [query, levels]);

  const hasFilters = Boolean(query || levels.length || modes.length);

  return (
    <main className="bg-white">
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-12 text-center sm:pt-16">
        <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px]">
          <span className="block">
            Chép Chính Tả <span className="text-[#da2527]">Diktat</span>
          </span>
          <span className="mt-1.5 block font-normal text-[22px] sm:text-[40px] lg:text-[40px]">SHD Tự Học Tiếng Đức</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Phương pháp nghe – chép kết hợp Shadowing
          <br />
          giúp nâng cao phản xạ nghe và chính tả
          <br />
          Chấm từng ký tự tức thì, hiển thị bản dịch đối chiếu
          <br />
          và lưu tiến độ hoàn toàn miễn phí
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
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Kho bài luyện Chép chính tả <span className="text-[#da2527]">Diktat</span>
          </h2>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#da2527]">
            {filtered.length} bài luyện
          </span>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
            <label className="relative block">
              <span className="sr-only">Tìm kiếm bài chép chính tả</span>
              <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên bài hoặc chủ đề"
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
                <legend className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">Chế độ luyện tập</legend>
                <div className="grid gap-2">
                  {modeOptions.map((choice) => (
                    <label key={choice.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={modes.includes(choice.value)}
                        onChange={() => toggleValue(setModes, choice.value)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#da2527]"
                      />
                      <span>{choice.label}</span>
                    </label>
                  ))}
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
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="diktat-exercise-grid">
              {filtered.map((item) => (
                <Link key={item.slug} href={`/chep-chinh-ta/${item.slug}`} className="group block min-w-0" title={item.title}>
                  <DynamicTopicThumbnail
                    skill="diktat"
                    title={item.title}
                    itemKey={item.slug}
                    topLeftText={`${item.questions} câu`}
                    badgeText={`Diktat · ${item.level}`}
                  />
                  <h3 className="mt-2.5 line-clamp-2 min-h-[2.65rem] text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {item.subtitle} · {item.duration}
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
                    <span>Bắt đầu luyện →</span>
                  </div>
                </Link>
              ))}
            </div>

            {!filtered.length && (
              <div role="status" className="rounded-2xl bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                Không tìm thấy bài chép chính tả phù hợp.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
