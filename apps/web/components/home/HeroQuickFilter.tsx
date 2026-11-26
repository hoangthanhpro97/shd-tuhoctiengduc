'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type Provider = 'goethe' | 'osd' | 'telc';
type Category = 'de-thi' | 'luyen-nghe' | 'luyen-doc' | 'bai-mau';

const examMonths = Array.from({ length: 12 }, (_, index) => index + 1);
const labelClassName = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500';
const selectClassName =
  'h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none transition-colors focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]';

export function HeroQuickFilter({
  exams = [],
}: {
  exams?: Array<{ slug: string; level: Level | 'C1'; providerFormat?: string }>;
}) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>('B1');
  const [provider, setProvider] = useState<Provider>('goethe');
  const [category, setCategory] = useState<Category>('de-thi');
  const [examMonth, setExamMonth] = useState<string>('1');

  function handleSearch() {
    if ((level === 'A1' || level === 'A2') && category === 'de-thi') {
      router.push(`/de-thi/a1-a2#${provider}`);
      return;
    }
    if (category === 'bai-mau') {
      router.push(`/bai-mau/${provider}#schreiben-${level.toLowerCase()}`);
      return;
    }
    const targetExam = exams.find(
      (exam) =>
        exam.level === level &&
        (exam.providerFormat ?? '')
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/gu, '')
          .toLowerCase()
          .includes(provider),
    );
    if (category === 'de-thi' && targetExam) {
      router.push(`/de-thi/${targetExam.slug}`);
      return;
    }
    const targetLevel = level.toLowerCase();
    const targetBase = category === 'luyen-nghe' ? '/luyen-nghe' : '/luyen-doc';
    router.push(`${targetBase}/${provider}#${targetLevel}`);
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl border-y border-slate-200/80 py-8 sm:py-10"
      role="region"
      aria-label="Bộ lọc bắt đầu ôn tập"
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          HÃY THIẾT KẾ MỤC TIÊU <span className="text-[#da2527]">DÀNH RIÊNG CHO BẠN.</span>
        </h2>
        <span className="text-xs font-medium text-slate-500">Chọn cấp độ và kỳ thi dự kiến để đi thẳng tới bài luyện phù hợp</span>
      </div>

      <div className="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.45fr)_minmax(0,1.85fr)_minmax(0,1.1fr)_auto]">
        <div>
          <label className={labelClassName} htmlFor="hero-level">Trình độ</label>
          <select id="hero-level" value={level} onChange={(event) => setLevel(event.target.value as Level)} className={selectClassName}>
            <option value="A1">Trình độ A1</option>
            <option value="A2">Trình độ A2</option>
            <option value="B1">Trình độ B1</option>
            <option value="B2">Trình độ B2</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="hero-provider">Chứng chỉ</label>
          <select id="hero-provider" value={provider} onChange={(event) => setProvider(event.target.value as Provider)} className={selectClassName}>
            <option value="goethe">Goethe-Zertifikat</option>
            <option value="osd">ÖSD Zertifikat</option>
            <option value="telc">TELC Deutsch</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="hero-category">Nội dung học</label>
          <select id="hero-category" value={category} onChange={(event) => setCategory(event.target.value as Category)} className={selectClassName}>
            <option value="de-thi">ÖSD &amp; Goethe Online-Test</option>
            <option value="luyen-nghe">Luyện nghe (Hören)</option>
            <option value="luyen-doc">Luyện đọc (Lesen)</option>
            <option value="bai-mau">Bài mẫu (Schreiben &amp; Sprechen)</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="hero-exam-month">Kỳ thi</label>
          <select id="hero-exam-month" value={examMonth} onChange={(event) => setExamMonth(event.target.value)} className={selectClassName}>
            {examMonths.map((month) => (
              <option key={month} value={String(month)}>Kỳ tháng {month}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <button
            onClick={handleSearch}
            className="flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#da2527] px-6 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#b81e20]"
            type="button"
          >
            <span>Bắt đầu miễn phí</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
