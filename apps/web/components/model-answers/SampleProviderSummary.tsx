'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { speakingTasks } from '../../data/speaking-fixtures';
import { writingTasks } from '../../data/writing-fixtures';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

export type Provider = 'goethe' | 'osd' | 'telc';
type SectionKey = 'schreiben-b1' | 'schreiben-b2' | 'sprechen-b1' | 'sprechen-b2';

const sectionLabels: Record<SectionKey, string> = {
  'schreiben-b1': 'Bài mẫu Schreiben B1',
  'schreiben-b2': 'Bài mẫu Schreiben B2',
  'sprechen-b1': 'Bài mẫu Sprechen B1',
  'sprechen-b2': 'Bài mẫu Sprechen B2',
};

const providerLabels: Record<Provider, string> = {
  goethe: 'Goethe',
  osd: 'ÖSD',
  telc: 'telc',
};

interface ProviderHeaderConfig {
  name: string;
  fullName: string;
  descriptionLine1: string;
  descriptionLine2: string;
  descriptionLine3: string;
}

const providerHeaderConfigs: Record<Provider, ProviderHeaderConfig> = {
  osd: {
    name: 'ÖSD',
    fullName: 'ÖSD Zertifikat',
    descriptionLine1: 'Kho bài mẫu Sprechen & Schreiben miễn phí chuẩn cấu trúc đề thi ÖSD Zertifikat B1 - B2.',
    descriptionLine2: 'Cung cấp dàn ý chi tiết, cấu trúc đề chuẩn Áo, mẫu câu Redemittel ăn điểm',
    descriptionLine3: 'đi kèm và trải nghiệm luyện thi trực tiếp chất lượng cao.',
  },
  goethe: {
    name: 'Goethe',
    fullName: 'Goethe-Zertifikat',
    descriptionLine1: 'Kho bài mẫu Sprechen & Schreiben miễn phí chuẩn cấu trúc đề thi Goethe-Zertifikat B1 - B2.',
    descriptionLine2: 'Cung cấp dàn ý chi tiết, cấu trúc đề chuẩn Goethe-Institut, mẫu câu Redemittel ăn điểm',
    descriptionLine3: 'đi kèm và trải nghiệm luyện thi trực tiếp chất lượng cao.',
  },
  telc: {
    name: 'telc',
    fullName: 'telc Deutsch',
    descriptionLine1: 'Kho bài mẫu Sprechen & Schreiben miễn phí chuẩn cấu trúc đề thi telc Deutsch B1 - B2.',
    descriptionLine2: 'Cung cấp dàn ý chi tiết, cấu trúc đề chuẩn telc, mẫu câu Redemittel ăn điểm',
    descriptionLine3: 'đi kèm và trải nghiệm luyện thi trực tiếp chất lượng cao.',
  },
};

function sampleProviderMatches(provider: Provider, taskProvider: string) {
  return provider === 'goethe'
    ? taskProvider.startsWith('goethe')
    : provider === 'osd'
    ? taskProvider.startsWith('osd')
    : taskProvider.startsWith('telc');
}

function UpcomingProviderSection({
  provider,
  level,
  isWriting,
}: {
  provider: Provider;
  level: 'B1' | 'B2';
  isWriting: boolean;
}) {
  const skillName = isWriting ? 'Schreiben' : 'Sprechen';
  const skillLabel = isWriting ? 'Viết' : 'Nói';
  const providerName = providerLabels[provider];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#da2527]">
              <Sparkles size={12} aria-hidden="true" />
              <span>{level} · SẮP RA MẮT</span>
            </span>
            <span className="text-xs font-medium text-slate-400">Đang biên tập dữ liệu</span>
          </div>
          <h3 className="mt-2.5 text-xl font-extrabold text-slate-900 sm:text-2xl">
            Kho bài mẫu {skillName} {level} ({providerName}) đang hoàn thiện
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Đội ngũ học thuật SHD Education đang biên tập trọn bộ bài thi mẫu {skillLabel} {level} chuẩn khảo thí {providerName}.
            Bao gồm {isWriting ? 'dàn ý lập luận chuyên sâu, bài viết mẫu đạt điểm tối đa' : 'bài phát biểu mẫu kèm Audio thu âm chuẩn bản ngữ Đức - Áo, sơ đồ dàn ý phản biện'} và cẩm nang Redemittel ăn điểm theo tiêu chí chấm thi chính thức.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              {isWriting ? '✍️ Bố cục văn phong chuẩn Châu Âu' : '🎙️ Audio thu âm phát âm chuẩn bản xứ'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              📋 Dàn ý chi tiết &amp; luận điểm phản biện
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              🎯 Mẫu câu Redemittel ăn điểm {level}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
          <Link
            href="/bai-mau"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-[#da2527] hover:text-[#da2527]"
          >
            <span>Khám phá kho bài mẫu</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <a
            href="https://shdeducation.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#da2527] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#b81e20]"
          >
            <span>Tìm hiểu khoá học {level}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function SampleProviderSummary({ provider }: { provider: Provider }) {
  const sections: SectionKey[] = ['schreiben-b1', 'schreiben-b2', 'sprechen-b1', 'sprechen-b2'];
  const config = providerHeaderConfigs[provider] ?? providerHeaderConfigs.goethe;
  const providerLabel = providerLabels[provider];

  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <header className="relative bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/75 to-white px-4 pb-12 pt-24 text-center sm:pt-28">
        <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px]">
          <span className="block">
            {providerLabel} · <span className="text-[#da2527]">Schreiben &amp; Sprechen</span>
          </span>
          <span className="mt-1.5 block font-normal text-[26px] sm:text-[44px] lg:text-[44px]">
            miễn phí - SHD Tự Học Tiếng Đức
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          <span className="block">{config.descriptionLine1}</span>
          <span className="block">{config.descriptionLine2}</span>
          <span className="block">{config.descriptionLine3}</span>
        </p>
        <div className="mt-6">
          <a
            href="https://shdeducation.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#da2527] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81e20] hover:shadow-md"
          >
            Tìm hiểu khoá học
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Navigation Anchor Bar - Kéo xuống ngay trên vạch đỏ phân loại bài, bỏ số lượng và ký tự */}
        <nav
          className="mb-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          aria-label={`Khu vực bài mẫu ${providerLabel}`}
        >
          {sections.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className="rounded-full border border-slate-200/90 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-[#da2527] hover:text-[#da2527] hover:shadow-sm"
            >
              {sectionLabels[section]}
            </a>
          ))}
        </nav>

        {/* Content Sections */}
        <div className="space-y-16">
          {sections.map((section) => {
            const isWriting = section.startsWith('schreiben');
            const level = section.endsWith('b1') ? 'B1' : 'B2';
            const writingItems = writingTasks.filter(
              (task) => task.level === level && sampleProviderMatches(provider, task.examProvider),
            );
            const speakingItems = speakingTasks.filter(
              (task) => task.level === level && sampleProviderMatches(provider, task.examProvider),
            );
            const itemCount = isWriting ? writingItems.length : speakingItems.length;

            return (
              <section id={section} key={section} className="scroll-mt-28">
                {/* Section Header - Tinh gọn: chỉ còn tiêu đề lớn, bỏ eyebrow và số lượng bài */}
                <div className="mb-6 border-b border-slate-100 pb-3">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {sectionLabels[section]}
                  </h2>
                </div>

                {/* Section Content: Grid or Upcoming */}
                {itemCount > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {isWriting
                      ? writingItems.map((task) => (
                          <Link
                            key={task.id}
                            href={`/bai-mau-schreiben/${task.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#da2527]/40 hover:shadow-lg"
                            title={task.title}
                          >
                            <DynamicTopicThumbnail
                              skill="schreiben"
                              title={task.title}
                              itemKey={task.slug}
                              topLeftText={task.partLabel}
                              badgeText={`${providerLabel} · ${level}`}
                            />
                            <div className="mt-3 flex flex-1 flex-col justify-between">
                              <h3 className="line-clamp-2 min-h-[2.65rem] text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
                                {task.title}
                              </h3>
                              <div className="mt-3 flex items-center border-t border-slate-100 pt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
                                  <span>Xem bài mẫu viết</span>
                                  <ArrowRight size={13} aria-hidden="true" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      : speakingItems.map((task) => (
                          <Link
                            key={task.id}
                            href={`/bai-mau-sprechen/${task.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#da2527]/40 hover:shadow-lg"
                            title={task.title}
                          >
                            <DynamicTopicThumbnail
                              skill="sprechen"
                              title={task.title}
                              itemKey={task.slug}
                              topLeftText={`Teil ${task.part}`}
                              badgeText={`${providerLabel} · ${level}`}
                            />
                            <div className="mt-3 flex flex-1 flex-col justify-between">
                              <h3 className="line-clamp-2 min-h-[2.65rem] text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
                                {task.title}
                              </h3>
                              <div className="mt-3 flex items-center border-t border-slate-100 pt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1">
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
                                  <span>Luyện nói &amp; Nghe Audio</span>
                                  <ArrowRight size={13} aria-hidden="true" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                  </div>
                ) : (
                  <UpcomingProviderSection provider={provider} level={level} isWriting={isWriting} />
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
