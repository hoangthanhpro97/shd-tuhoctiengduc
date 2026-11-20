'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type Provider = 'goethe' | 'osd' | 'telc';
type Category = 'de-thi' | 'luyen-nghe' | 'luyen-doc' | 'bai-mau';

export function HeroQuickFilter({ exams = [] }: { exams?: Array<{ slug: string; level: Level | 'C1'; providerFormat?: string }> }) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>('B1');
  const [provider, setProvider] = useState<Provider>('goethe');
  const [category, setCategory] = useState<Category>('de-thi');

  function handleSearch() {
    if ((level === 'A1' || level === 'A2') && category === 'de-thi') {
      router.push(`/de-thi/a1-a2#${provider}`);
      return;
    }
    if (category === 'bai-mau') {
      router.push(`/bai-mau/${provider}#schreiben-${level.toLowerCase()}`);
      return;
    }
    const targetExam = exams.find((exam) => exam.level === level && (exam.providerFormat ?? '').toLowerCase().includes(provider === 'osd' ? 'osd' : provider));
    if (category === 'de-thi' && targetExam) {
      router.push(`/de-thi/${targetExam.slug}`);
      return;
    }
    const targetLevel = level.toLowerCase();
    const targetBase = category === 'luyen-nghe' ? '/luyen-nghe' : '/luyen-doc';
    router.push(`${targetBase}/${provider}#${targetLevel}`);
  }

  return (
    <div className="w-full max-w-7xl mx-auto" role="region" aria-label="Bộ lọc bắt đầu ôn tập">
      <h2 className="mb-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">HÃY THIẾT KẾ MỤC TIÊU <span className="text-[#da2527]">DÀNH RIÊNG CHO BẠN.</span></h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="hero-level">Trình độ</label>
          <select id="hero-level" value={level} onChange={(event) => setLevel(event.target.value as Level)} className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-transparent px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]">
            <option value="A1">Trình độ A1</option>
            <option value="A2">Trình độ A2</option>
            <option value="B1">Trình độ B1</option>
            <option value="B2">Trình độ B2</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="hero-provider">Chứng chỉ</label>
          <select id="hero-provider" value={provider} onChange={(event) => setProvider(event.target.value as Provider)} className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-transparent px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]">
            <option value="goethe">Goethe-Zertifikat</option>
            <option value="osd">ÖSD Zertifikat</option>
            <option value="telc">TELC Deutsch</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="hero-category">Nội dung học</label>
          <select id="hero-category" value={category} onChange={(event) => setCategory(event.target.value as Category)} className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-transparent px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]">
            <option value="de-thi">ÖSD &amp; Goethe Online-Test</option>
            <option value="luyen-nghe">Luyện nghe (Hören)</option>
            <option value="luyen-doc">Luyện đọc (Lesen)</option>
            <option value="bai-mau">Bài mẫu (Schreiben &amp; Sprechen)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 md:col-span-4">
          <button onClick={handleSearch} className="flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#da2527] px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b81e20]" type="button"><span>Bắt đầu miễn phí</span><span aria-hidden="true">→</span></button>
          <Link href="/de-thi" className="flex h-11 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50/50">Khám phá kho bài học</Link>
        </div>
      </div>
    </div>
  );
}
