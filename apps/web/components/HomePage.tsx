'use client';

import { ArrowRight, BookOpenCheck, Headphones, PenLine, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getHomeData } from '../data/access';
import type { HomeData } from '../data/access';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from './auth/AuthProvider';
import { BookArtCover } from './home/BookArtCover';
import {
  FloatingBooksBackground,
  FloatingLibraryMotionToggle,
  FloatingLibraryProvider,
} from './home/FloatingBooksBackground';
import { HeroQuickFilter } from './home/HeroQuickFilter';
import {
  CefrLevelRoadmapSection,
  DiktatStudioSection,
  ProductiveAtelierSection,
  ProviderExamShowcase,
  SkillSpotlightSection,
} from './home/HomeLearningShowcase';
import { RevealOnScroll } from './home/RevealOnScroll';
import { StudentDashboard } from './home/StudentDashboard';

const homepageSpeakingCards = [
  { title: 'Goethe B1 Teil 1 · Gemeinsam etwas planen', provider: 'Goethe B1', part: 'Teil 1', itemKey: 'goethe-b1-teil-1', href: '/bai-mau-sprechen/goethe-b1-teil-1-party-planen' },
  { title: 'Goethe B1 Teil 2 · Kinder und Mobiltelefone', provider: 'Goethe B1', part: 'Teil 2', itemKey: 'goethe-b1-teil-2', href: '/bai-mau-sprechen/goethe-b1-teil-2-kinder-und-mobiltelefone' },
  { title: 'ÖSD ZDÖ B1 Teil 1 · Sich kennenlernen', provider: 'ÖSD ZDÖ B1', part: 'Teil 1', itemKey: 'osd-zdo-b1-teil-1', href: '/bai-mau-sprechen/osd-zdo-b1-teil-1-kennenlernen' },
  { title: 'Goethe B2 Teil 1 · Präsentation', provider: 'Goethe B2', part: 'Teil 1', itemKey: 'goethe-b2-teil-1', href: '/bai-mau-sprechen' },
];

const homepageWritingCards = [
  { title: 'Goethe B1 Aufgabe 1 · Wochenendausflug', provider: 'Goethe B1', part: 'Aufgabe 1', itemKey: 'goethe-b1-aufgabe-1', href: '/bai-mau-schreiben/goethe-b1-aufgabe-1-ausflug-nach-da-lat' },
  { title: 'Goethe B1 Aufgabe 2 · Handys in der Schule', provider: 'Goethe B1', part: 'Aufgabe 2', itemKey: 'goethe-b1-aufgabe-2', href: '/bai-mau-schreiben/goethe-b1-aufgabe-2-handys-in-der-schule' },
  { title: 'Goethe B1 Aufgabe 3 · Termin verschieben', provider: 'Goethe B1', part: 'Aufgabe 3', itemKey: 'goethe-b1-aufgabe-3', href: '/bai-mau-schreiben/goethe-b1-aufgabe-3-termin-verschieben' },
  { title: 'ÖSD B1 Schreiben · Kursbeginn', provider: 'ÖSD B1', part: 'Schreiben', itemKey: 'osd-b1-schreiben', href: '/bai-mau-schreiben/osd-zdo-b1-schreiben-kursbeginn' },
];

const shdPillars = [
  {
    icon: BookOpenCheck,
    iconClass: 'bg-rose-50 text-[#da2527]',
    title: 'Đề mô phỏng ÖSD, Goethe & TELC',
    description: 'Đề thi mô phỏng chuẩn định dạng khảo thí, kèm đáp án, dẫn chứng verbatim và phân tích bẫy tư duy chi tiết.',
    href: '/de-thi',
  },
  {
    icon: Headphones,
    iconClass: 'bg-sky-50 text-[#0284c7]',
    title: 'Luyện tập Hören & Lesen',
    description: 'Kho bài luyện Nghe – Đọc phân cấp A1 đến B2 theo từng Teil, chủ đề thực tế kèm transcript song ngữ.',
    href: '/luyen-nghe',
  },
  {
    icon: Sparkles,
    iconClass: 'bg-amber-50 text-amber-700',
    title: 'Nghe chép chính tả (Diktat)',
    description: 'Luyện phản xạ bắt âm từng câu ngắt tự động, phát hiện lỗi từng từ và luyện nhại giọng Shadowing.',
    href: '/chep-chinh-ta',
  },
  {
    icon: PenLine,
    iconClass: 'bg-emerald-50 text-emerald-700',
    title: 'Bài mẫu Schreiben & Sprechen',
    description: 'Tổng hợp bài mẫu song ngữ, dàn ý triển khai từng bước và danh mục mẫu câu Redemittel ăn điểm.',
    href: '/bai-mau',
  },
] as const;

function GuestHome({ data }: { data: HomeData | null }) {
  const [cookie, setCookie] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const roadmapWrapRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <FloatingLibraryProvider>
        <main className="guest-home bg-white">
          {/* ================= 1. CENTERED HERO + 3-LAYER FLOATING IMAGE GALLERY ================= */}
          <section
            ref={heroRef}
            className="shd-fb-scene relative flex min-h-[640px] w-full items-center justify-center border-b border-slate-200/75 bg-white sm:min-h-[680px] lg:min-h-[710px]"
            data-testid="hero-section"
          >
            {/* 3-Plane Interactive Mouse-Parallax & Autonomous Drifting Books */}
            <FloatingBooksBackground sceneRef={heroRef} variant="hero" />

            {/* Truly Centered Hero Content Block (Horizontally & Vertically Centered below TopAnnouncementBar) */}
            <div className="shd-fb-content mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 pb-16 pt-[96px] text-center sm:px-6 sm:pb-20 sm:pt-[108px]">
              <h1 className="text-3xl font-black leading-[1.14] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
                <span className="block text-slate-900 sm:whitespace-nowrap">Nền tảng tự học</span>
                <span className="mt-1.5 block text-[#da2527] sm:whitespace-nowrap">Tiếng Đức Online - 4 kỹ năng</span>
                <span className="mt-2 block font-medium text-slate-800 sm:whitespace-nowrap">Miễn phí và chất lượng</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                SHD Tự Học Tiếng Đức cung cấp đầy đủ nội dung chất lượng gồm đề thi mô phỏng chuẩn ÖSD, Goethe &amp; TELC, luyện đề Lesen, Hören &amp; bài mẫu Schreiben, Sprechen kết hợp nghe chép chính tả Diktat được phát triển bởi SHD Education.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#da2527] px-8 text-sm font-bold text-white transition-colors hover:bg-[#b81e20]"
                >
                  <span>Đăng ký miễn phí ngay</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Discreet accessibility pause/resume motion control centered cleanly at bottom margin */}
            <FloatingLibraryMotionToggle className="!absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap" />
          </section>

          {/* ================= 2. FLAT FEATURES ON WHITE: TỰ HỌC TIẾNG ĐỨC CỦA SHD CÓ GÌ? ================= */}
          <section
            ref={featuresRef}
            className="shd-fb-scene relative py-16 sm:py-20"
            id="explore"
          >
            <FloatingBooksBackground sceneRef={featuresRef} variant="features" />

            <div className="shd-fb-content mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <h2 className="text-3xl font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]">
                      Tự học Tiếng Đức <br />của <span className="text-[#da2527]">SHD</span> có gì
                      <span className="ml-2 inline-block align-baseline text-5xl font-black text-[#da2527] lg:text-6xl">?</span>
                    </h2>
                    <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-600 sm:text-sm">
                      Kết hợp phòng thi mô phỏng sát thực tế, giải thích đáp án đối chiếu dẫn chứng verbatim và hệ thống rèn luyện 4 kỹ năng chuyên biệt.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-8">
                    {shdPillars.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <Link
                          key={feature.title}
                          href={feature.href}
                          data-testid="dol-feature-card"
                          className="group flex flex-col justify-between py-1"
                        >
                          <div>
                            <div
                              className={`mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${feature.iconClass}`}
                            >
                              <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527] sm:text-lg">
                              {feature.title}
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                              {feature.description}
                            </p>
                          </div>
                          <span className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1 sm:text-sm">
                            <span>Khám phá</span>
                            <ArrowRight size={13} aria-hidden="true" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>

          {/* ================= 3. QUICK GOAL FILTER ================= */}
          <section className="px-4 pb-6 sm:px-6 lg:px-8">
            <HeroQuickFilter exams={data?.exams} />
          </section>

          {/* ================= 4. ĐỀ THI ÖSD, GOETHE & TELC + FLOATING BOOKS ================= */}
          <ProviderExamShowcase exams={data?.exams ?? []} />

          {/* ================= 5. LUYỆN HÖREN & LESEN EDITORIAL SPOTLIGHT ================= */}
          <SkillSpotlightSection data={data} />

          {/* ================= 6. BÀI MẪU SCHREIBEN & SPRECHEN FLAT STUDIO ================= */}
          <ProductiveAtelierSection speakingCards={homepageSpeakingCards} writingCards={homepageWritingCards} />

          {/* ================= 7. NGHE CHÉP CHÍNH TẢ DIKTAT ================= */}
          <DiktatStudioSection />

          {/* ================= 8. LỘ TRÌNH CEFR A1 – B2 + FLOATING TRANSITION ================= */}
          <div ref={roadmapWrapRef} className="shd-fb-scene relative">
            <FloatingBooksBackground sceneRef={roadmapWrapRef} variant="roadmap" />
            <div className="shd-fb-content">
              <CefrLevelRoadmapSection />
            </div>
          </div>

          {/* ================= 9. ACCOUNT REGISTRATION CTA ================= */}
          <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" id="contact" aria-labelledby="cta-register-heading">
            <RevealOnScroll>
              <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-7 text-white sm:p-10 lg:p-12">
                <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-6 lg:pr-4">
                    <h2 id="cta-register-heading" className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                      Lưu tiến độ làm bài và học trọn vẹn <span className="text-[#f87171]">miễn phí.</span>
                    </h2>

                    <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                      Tạo tài khoản miễn phí để tiếp tục bài thi đang làm dở trên mọi thiết bị, theo dõi lịch sử điểm số theo từng Teil và nhận gợi ý lộ trình phù hợp mục tiêu A1 – B2.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => setAuthOpen(true)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#da2527] px-7 text-sm font-bold text-white transition-colors hover:bg-[#b81e20]"
                      >
                        <span>Đăng ký tài khoản miễn phí</span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                      <Link
                        href="/de-thi"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
                      >
                        <span>Làm test thử ngay</span>
                      </Link>
                    </div>
                  </div>

                  {/* Tactile German Textbooks Trio Composition */}
                  <div className="hidden items-center justify-center lg:col-span-6 lg:flex" aria-hidden="true">
                    <div className="relative flex h-64 w-full items-center justify-center">
                      <div className="-translate-x-10 -rotate-[10deg] scale-[0.84] opacity-85 transition-transform duration-500 hover:-rotate-[6deg]">
                        <BookArtCover item={{ kind: 'textbook', bookId: 'menschen-a1' }} compact />
                      </div>
                      <div className="z-10 translate-y-2 rotate-[3deg] scale-[0.94] transition-transform duration-500 hover:rotate-0">
                        <BookArtCover item={{ kind: 'textbook', bookId: 'netzwerk-b1' }} compact />
                      </div>
                      <div className="translate-x-10 rotate-[10deg] scale-[0.84] opacity-90 transition-transform duration-500 hover:rotate-[6deg]">
                        <BookArtCover item={{ kind: 'textbook', bookId: 'goethe-b2-erfolg' }} compact />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </section>
        </main>
      </FloatingLibraryProvider>

      {cookie && (
        <div className="cookie" role="status">
          <p>SHD dùng cookie cần thiết để lưu phiên học tập và cải thiện trải nghiệm.</p>
          <button className="button button-primary shrink-0" type="button" onClick={() => setCookie(false)}>
            Đã hiểu
          </button>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  useEffect(() => {
    getHomeData().then(setData);
  }, []);
  return user ? <StudentDashboard data={data} user={user} /> : <GuestHome data={data} />;
}
