'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LearningSkill } from '../../data/deep-learning-fixtures';
import type { SkillExercise } from '../../lib/server/exam-content-loader';
import { getSkillExerciseTitle } from '../../lib/skill-catalog';
import { AuthModal } from '../auth/AuthModal';
import { SkillProviderCarouselRow } from '../exam/SkillProviderCarouselRow';
import { ExamBookCover } from '../exam/ExamBookCover';
import { TopAnnouncementBar } from '../layout/TopAnnouncementBar';

const recentSuffixes = ['04', '03', '02'];

function LevelHeading({ level, title, comingSoon = false }: { level: 'B1' | 'B2' | 'A1' | 'A2'; title: string; comingSoon?: boolean }) {
  return <h3 className="mb-3.5 flex flex-wrap items-center gap-2.5"><span className="rounded-md bg-[#0284c7] px-2.5 py-1 text-xs font-black text-white">{level}</span><span className="text-lg font-extrabold text-slate-800">{title}</span>{comingSoon && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Sắp ra mắt</span>}</h3>;
}

function ComingSoonCard({ skill, level }: { skill: LearningSkill; level: 'A1' | 'A2' }) {
  const isReading = skill === 'Lesen';
  const title = `ÖSD Zertifikat ${level} (Z${level})`;
  return <article className="flex flex-col gap-2 rounded-2xl bg-slate-50/70 p-2 sm:flex-row"><div className="w-36 shrink-0 rounded-xl p-3 sm:w-40"><ExamBookCover className="h-44 rounded-xl p-2" stageClassName="bg-sky-100/80" level={level} provider="osd" simulationNumber="01" title={title} /></div><div className="flex min-w-0 flex-1 flex-col justify-center px-2 pb-3 sm:py-3 sm:pr-4"><span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Sắp ra mắt</span><h4 className="mt-2 text-base font-extrabold text-slate-900">{title}</h4><p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">Luyện {isReading ? 'Đọc hiểu Lesen' : 'Nghe hiểu Hören'} sơ cấp theo cấu trúc chuẩn Áo, xây nền tảng vững chắc cho kỳ thi ÖSD.</p><span className="mt-3 text-xs font-bold text-emerald-600">Đang hiệu đính lời giải chi tiết</span></div></article>;
}

function RecentItem({ item }: { item: SkillExercise }) {
  const base = item.skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc';
  return <Link href={`/${base}/${item.slug}`} className="group block"><h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{getSkillExerciseTitle(item)}</h3><p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.questions} câu · {item.durationMinutes} phút · {item.provider} {item.level}</p><span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527]"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50"><Play size={10} fill="currentColor" /></span>Làm bài <span aria-hidden="true">→</span></span></Link>;
}

export function SkillProviderAcademicPage({ skill, items }: { skill: LearningSkill; items: SkillExercise[] }) {
  const isReading = skill === 'Lesen';
  const label = isReading ? 'đọc' : 'nghe';
  const skillLabel = isReading ? 'Lesen' : 'Hören';
  const recent = useMemo(() => recentSuffixes.flatMap((suffix) => items.filter((item) => item.sourceExamSlug.endsWith(`-${suffix}`))).slice(0, 6), [items]);
  const b1 = items.filter((item) => item.level === 'B1');
  const b2 = items.filter((item) => item.level === 'B2');
  const [authOpen, setAuthOpen] = useState(false);
  return <main className="bg-white">
    <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28"><TopAnnouncementBar placement="hero" /><h1 className="text-4xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[50px]"><span className="block">Luyện {label} <span className="text-[#da2527]">ÖSD {skillLabel}</span> Online-Test</span><span className="mt-1.5 block">miễn phí - SHD Tự Học Tiếng Đức</span></h1><p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">Kho bài luyện {isReading ? 'Đọc hiểu' : 'Nghe hiểu'} chuẩn Viện Khảo thí ÖSD Áo đầy đủ 4 cấp độ B1, B2, A1 và A2.<br className="hidden sm:inline" /> {isReading ? 'Gạch chân dẫn chứng trực tiếp trong văn bản, học từ vựng trọng tâm và giải thích bẫy tư duy.' : 'Luyện nghe phân vai A/B song ngữ Đức – Việt và giải thích bẫy tư duy chi tiết.'}</p><button type="button" onClick={() => setAuthOpen(true)} aria-haspopup="dialog" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#da2527] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81e20]">Đăng ký luyện {label} miễn phí</button></header>
    <section className="mx-auto mt-10 max-w-6xl px-4"><h2 className="mb-5 text-xl font-extrabold text-slate-900 sm:text-2xl">Bài luyện {label} ÖSD mới cập nhật</h2><div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">{recent.map((item) => <RecentItem item={item} key={item.slug} />)}</div></section>
    <nav className="mx-auto mt-12 mb-7 flex max-w-6xl flex-wrap items-center gap-2.5 px-4" aria-label="Phân loại cấp độ ÖSD"><Link href="#osd-skill-catalog" className="rounded-full border border-[#da2527] bg-[#da2527] px-4 py-2 text-xs font-bold text-white">Tất cả cấp độ</Link><Link href="#b1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#da2527] hover:text-[#da2527]">ÖSD B1</Link><Link href="#b2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#da2527] hover:text-[#da2527]">ÖSD B2</Link><Link href="#a1" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#da2527] hover:text-[#da2527]">ÖSD A1 · Sắp ra mắt</Link><Link href="#a2" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#da2527] hover:text-[#da2527]">ÖSD A2 · Sắp ra mắt</Link></nav>
    <section className="mx-auto max-w-6xl px-4"><h2 id="osd-skill-catalog" className="mb-6 flex scroll-mt-24 items-center gap-3 border-b border-slate-200 pb-3 text-2xl font-extrabold text-slate-900"><span className="h-7 w-1.5 rounded-full bg-[#0284c7]" />Bài luyện {label} từ ÖSD Zertifikat</h2><section id="b1" className="scroll-mt-24"><LevelHeading level="B1" title="ÖSD Zertifikat B1 (ZB1)" /><SkillProviderCarouselRow items={b1} /></section><section id="b2" className="mt-10 scroll-mt-24"><LevelHeading level="B2" title="ÖSD Zertifikat B2 (ZB2)" /><SkillProviderCarouselRow items={b2} /></section><section id="a1" className="mt-10 scroll-mt-24"><LevelHeading level="A1" title="ÖSD Zertifikat A1 (ZA1)" comingSoon /><ComingSoonCard skill={skill} level="A1" /></section><section id="a2" className="mt-10 mb-16 scroll-mt-24"><LevelHeading level="A2" title="ÖSD Zertifikat A2 (ZA2)" comingSoon /><ComingSoonCard skill={skill} level="A2" /></section></section>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </main>;
}
