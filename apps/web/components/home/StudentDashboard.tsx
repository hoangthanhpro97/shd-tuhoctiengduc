'use client';

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  RotateCcw,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DemoUser } from '../auth/AuthProvider';
import type { HomeData } from '../../data/access';
import {
  FloatingBooksBackground,
  FloatingLibraryMotionToggle,
  FloatingLibraryProvider,
} from './FloatingBooksBackground';
import {
  DiktatStudioSection,
  ProductiveAtelierSection,
  ProviderExamShowcase,
  SkillSpotlightSection,
  type AttemptSummaryItem,
} from './HomeLearningShowcase';

const skillNavCards = [
  {
    title: 'ÖSD & Goethe Online-Test',
    href: '/de-thi',
    bgImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Luyện nghe Hören',
    href: '/luyen-nghe',
    bgImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Luyện đọc Lesen',
    href: '/luyen-doc',
    bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Chép Chính Tả Diktat',
    href: '/chep-chinh-ta',
    bgImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Bài mẫu Schreiben',
    href: '/bai-mau-schreiben',
    bgImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Bài mẫu Sprechen',
    href: '/bai-mau-sprechen',
    bgImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80',
  },
] as const;

const starterRecommendedCards = [
  {
    title: 'Goethe B1 · Modellsatz 01',
    category: 'Goethe Online-Test',
    categoryClass: 'text-emerald-700',
    subtitle: 'Trọn bộ Lesen 5 Teil & Hören 4 Teil chuẩn Viện Goethe',
    href: '/de-thi/goethe-b1-test-01',
    cta: 'Vào thi thử',
  },
  {
    title: 'ÖSD B1 · Modelltest 01',
    category: 'ÖSD Online-Test',
    categoryClass: 'text-[#0284c7]',
    subtitle: 'Kiểm tra kỹ năng đọc hiểu & nghe hiểu chuẩn khảo thí Áo',
    href: '/de-thi/osd-b1-mock-01',
    cta: 'Vào thi thử',
  },
  {
    title: 'Alltägliche Kommunikation · Diktat B1',
    category: 'Chép chính tả',
    categoryClass: 'text-amber-700',
    subtitle: '16 câu nghe chép phản xạ & nhại giọng Shadowing',
    href: '/chep-chinh-ta/diktat-b1-bai-01',
    cta: 'Bắt đầu chép',
  },
] as const;

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

const standardPlanFeatures = [
  'ÖSD & Goethe Online-Test',
  'Kho bài mẫu Schreiben/Sprechen',
  'Chép chính tả Diktat',
];

const shdStudentPlanFeatures = [
  'ÖSD & Goethe Online-Test',
  'Kho bài mẫu Schreiben/Sprechen',
  'Chép chính tả Diktat',
  'Làm và nhận bài sửa Assignment',
  'Trợ lý Sprechen ở nhà',
  'Bài tập như giáo viên ở nhà',
];

export interface StudentDashboardProps {
  data: HomeData | null;
  user?: DemoUser | null;
}

export function StudentDashboard({ data, user }: StudentDashboardProps) {
  const firstName = user?.name ? user.name.split(' ').slice(-1)[0] : 'Học viên';

  const [attempts, setAttempts] = useState<AttemptSummaryItem[]>([]);
  const [attemptsLoaded, setAttemptsLoaded] = useState(false);

  const studentSceneRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [renewalMounted, setRenewalMounted] = useState(false);
  const [renewalVisible, setRenewalVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/attempts?limit=6', { cache: 'no-store' })
      .then(async (res) => (res.ok ? ((await res.json()) as { items?: AttemptSummaryItem[] }).items ?? [] : []))
      .then((items) => {
        if (!cancelled) setAttempts(items);
      })
      .catch(() => {
        if (!cancelled) setAttempts([]);
      })
      .finally(() => {
        if (!cancelled) setAttemptsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.72, 580);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const openRenewalModal = useCallback(() => {
    setRenewalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRenewalVisible(true);
      });
    });
  }, []);

  const closeRenewalModal = useCallback(() => {
    setRenewalVisible(false);
    window.setTimeout(() => {
      setRenewalMounted(false);
    }, 220);
  }, []);

  useEffect(() => {
    if (!renewalMounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRenewalModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [renewalMounted, closeRenewalModal]);

  return (
    <FloatingLibraryProvider>
      <main className="student-home min-h-screen bg-white pb-16 font-sans">
        {/* ================= FLAT WELCOME & CONTINUE LEARNING ZONE ================= */}
        <div
          ref={studentSceneRef}
          className="shd-fb-scene relative w-full border-b border-slate-200/80 bg-white"
        >
          <FloatingBooksBackground sceneRef={studentSceneRef} variant="student-edge" />

          <div className="shd-fb-content mx-auto max-w-7xl px-4 pb-10 pt-[96px] sm:px-6 sm:pt-[106px] lg:px-8">
            {/* Personalized Greeting Bar */}
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Xin chào, <span className="text-[#da2527]">{firstName}</span>
                </h1>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Tài khoản {user?.plan ?? 'Free'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <FloatingLibraryMotionToggle />
                <Link
                  href="/tai-khoan#history"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527]"
                >
                  <span>Lịch sử làm bài</span>
                </Link>
                <Link
                  href="/hoc-tap"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#da2527] px-4 text-xs font-bold text-white transition-colors hover:bg-[#b81e20]"
                >
                  <span>Góc học tập của tôi</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* 1. Quick Skill Carousel */}
            <section className="relative" aria-label="Điều hướng nhanh kỹ năng">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Trượt sang trái"
                className={`absolute -left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527] sm:-left-4 sm:h-10 sm:w-10 ${
                  canScrollLeft ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <ChevronLeft size={19} strokeWidth={2.4} />
              </button>

              <div
                ref={carouselRef}
                onScroll={updateScrollButtons}
                className="no-scrollbar flex items-stretch gap-3.5 overflow-x-auto scroll-smooth py-1.5 sm:gap-4"
              >
                {skillNavCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group relative flex h-[86px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-xl px-5 text-center transition-all duration-200 hover:-translate-y-0.5 sm:h-[92px] sm:w-[272px]"
                  >
                    <img
                      src={card.bgImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/50 to-slate-900/40"
                    />
                    <span className="relative z-10 whitespace-normal break-words text-center text-[15px] font-bold leading-snug text-white sm:text-[17px]">
                      {card.title}
                    </span>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Trượt sang phải"
                className={`absolute -right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-[#da2527] hover:text-[#da2527] sm:-right-4 sm:h-10 sm:w-10 ${
                  canScrollRight ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <ChevronRight size={19} strokeWidth={2.4} />
              </button>
            </section>

            {/* 2. Flat Continue Learning & History Section */}
            <section className="mt-9 sm:mt-10" aria-label="Bài làm gần đây">
              <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {attempts.length > 0 ? 'Bài làm gần đây' : 'Bắt đầu lộ trình luyện tập'}
                </h2>
                <Link
                  href="/tai-khoan"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#da2527] hover:underline sm:text-sm"
                >
                  <span>Xem lịch sử</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {!attemptsLoaded ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 animate-pulse border-b border-slate-200/80 py-2" />
                  ))}
                </div>
              ) : attempts.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {attempts.slice(0, 3).map((attempt) => {
                    const pct = attempt.totalQuestions > 0
                      ? Math.round((attempt.answeredCount / attempt.totalQuestions) * 100)
                      : 0;
                    const isComplete = attempt.status !== 'in_progress';
                    const href = isComplete ? `/ket-qua/${attempt.attemptId}` : `/lam-bai/${attempt.attemptId}`;

                    return (
                      <article
                        key={attempt.attemptId}
                        className="group flex flex-col justify-between border-b border-slate-200/85 pb-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                            <span className={isComplete ? 'uppercase tracking-wider text-emerald-700' : 'uppercase tracking-wider text-[#da2527]'}>
                              {attempt.mode === 'practice' ? 'Luyện tập' : 'Thi thử'}
                            </span>
                            <span className="text-slate-400">
                              {isComplete ? 'Đã nộp bài' : 'Đang làm dở'}
                            </span>
                          </div>

                          <h3 className="mt-2 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                            {attempt.title}
                          </h3>

                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Tiến độ: {attempt.answeredCount}/{attempt.totalQuestions || 0} câu</span>
                            <span className="font-bold text-slate-700">{pct}%</span>
                          </div>

                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-[#da2527]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <Link
                            href={href}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1 sm:text-sm"
                          >
                            {isComplete ? (
                              <>
                                <RotateCcw size={13} />
                                <span>Xem kết quả</span>
                              </>
                            ) : (
                              <>
                                <span>Làm tiếp</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {starterRecommendedCards.map((item) => (
                    <article
                      key={item.title}
                      className="group flex flex-col justify-between border-b border-slate-200/85 pb-4"
                    >
                      <div>
                        <span className={`text-[11px] font-bold ${item.categoryClass}`}>
                          {item.category}
                        </span>
                        <h3 className="mt-1.5 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.subtitle}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1 sm:text-sm"
                        >
                          <span>{item.cta}</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* 3. Flat Banner Gia hạn miễn phí */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="my-8" aria-label="Gia hạn học tập">
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-rose-200/80 bg-[#fff8f8] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#da2527] text-white">
                    <Sparkles size={13} />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">Gia hạn miễn phí!</h3>
                </div>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Chào {firstName}, nhận thêm thời gian sử dụng trọn bộ đề thi mô phỏng và bài luyện 4 kỹ năng tiếng Đức hoàn toàn miễn phí.
                </p>
              </div>
              <button
                type="button"
                onClick={openRenewalModal}
                data-testid="renewal-trigger-top"
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#da2527] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#b81e20] sm:text-sm"
              >
                <span>Gia hạn miễn phí</span>
              </button>
            </div>
          </section>
        </div>

        {/* 4. Flat Editorial Showcases */}
        <ProviderExamShowcase exams={data?.exams ?? []} />
        <SkillSpotlightSection data={data} />
        <ProductiveAtelierSection speakingCards={homepageSpeakingCards} writingCards={homepageWritingCards} />
        <DiktatStudioSection />

        {/* 5. Banner Gia hạn lần 2 & SHD Placement Test Consultation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="my-8" aria-label="Gia hạn học tập lần 2">
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-rose-200/80 bg-[#fff8f8] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">Gia hạn miễn phí!</h3>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Tận hưởng lộ trình ôn luyện chuẩn khảo thí ÖSD &amp; Goethe, không lo gián đoạn nhịp ôn thi của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={openRenewalModal}
                data-testid="renewal-trigger-bottom"
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#da2527] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#b81e20] sm:text-sm"
              >
                <span>Gia hạn miễn phí</span>
              </button>
            </div>
          </section>

          <section
            className="relative my-10 overflow-hidden rounded-2xl bg-[#da2527] p-6 text-white sm:p-8 lg:p-11"
            id="shd-consult"
            aria-label="Tư vấn đầu vào SHD"
          >
            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                  Đăng ký test đầu vào Tiếng Đức <span className="text-[#fde047]">miễn phí</span> và nhận tư vấn
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-red-50/90 sm:text-sm">
                  Làm bài test đánh giá toàn diện 4 kỹ năng và nhận tư vấn định hướng lộ trình học cấp tốc A1 – B2 chuẩn ÖSD, Goethe hoặc Du học nghề Đức từ cố vấn chuyên môn SHD.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="tel:+842862760276"
                    className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-white/15 sm:text-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#da2527]">
                      <Phone size={17} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-red-100/90">Hotline tư vấn học thuật</span>
                      <span className="text-sm font-extrabold tracking-wide text-white">(+84-28) 6276 0276</span>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white sm:text-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#da2527]">
                      <MapPin size={17} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-red-100/90">Cơ sở đào tạo</span>
                      <span>Bình Thạnh, TP. Hồ Chí Minh &amp; Lớp Online</span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/de-thi"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-xs font-extrabold text-[#da2527] transition-colors hover:bg-red-50 sm:text-sm"
                  >
                    <span>Làm test đầu vào ngay</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="overflow-hidden rounded-xl ring-1 ring-white/20">
                      <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=640&q=80"
                        alt="Lớp học tiếng Đức SHD"
                        className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-52"
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl ring-1 ring-white/20">
                      <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80"
                        alt="Nhóm học viên tự học tiếng Đức"
                        className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-40"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                    <div className="overflow-hidden rounded-xl ring-1 ring-white/20">
                      <img
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=640&q=80"
                        alt="Buổi thảo luận Sprechen cùng giáo viên"
                        className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-40"
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl ring-1 ring-white/20">
                      <img
                        src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=640&q=80"
                        alt="Không gian học tập hiện đại SHD"
                        className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-52"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Renewal Modal */}
        {renewalMounted && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="renewal-modal-title"
            data-testid="renewal-modal"
            onClick={closeRenewalModal}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
              renewalVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-[680px] rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out sm:p-8 ${
                renewalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="renewal-modal-title" className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                    Gia hạn miễn phí
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Tìm hiểu khóa học Tiếng Đức tại SHD Education và nhận ngay code tự học 1 tháng trị giá 299.000đ khi đăng ký nhập học hoặc inbox SHD để mua gói nhé!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRenewalModal}
                  aria-label="Đóng hộp thoại"
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div>
                    <div className="flex justify-end">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <User size={20} />
                      </span>
                    </div>
                    <div className="mt-2 text-right text-sm font-medium text-slate-500">Người dùng</div>
                    <div className="mt-1.5 text-right text-2xl font-extrabold tracking-tight text-slate-900">299.000đ/ 1tháng</div>
                    <ul className="mt-5 space-y-2.5">
                      {standardPlanFeatures.map((feature) => (
                        <li key={feature} className="flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-700 sm:text-[13px]">
                          <span>{feature}</span>
                          <Check size={15} className="shrink-0 text-emerald-500" strokeWidth={2.5} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-7">
                    <Link
                      href="/tai-khoan-pro"
                      onClick={closeRenewalModal}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:text-sm"
                    >
                      Inbox để mua gói
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border-[1.5px] border-[#da2527] bg-white p-5 sm:p-6">
                  <div>
                    <div className="flex justify-end">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da2527] text-[10px] font-black tracking-tight text-white">
                        SHD
                      </span>
                    </div>
                    <div className="mt-2 text-right text-sm font-semibold text-slate-700">Học viên SHD</div>
                    <div className="mt-1.5 text-right text-2xl font-extrabold tracking-tight text-slate-900">Miễn Phí</div>
                    <ul className="mt-5 space-y-2.5">
                      {shdStudentPlanFeatures.map((feature) => (
                        <li key={feature} className="flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-700 sm:text-[13px]">
                          <span>{feature}</span>
                          <Check size={15} className="shrink-0 text-emerald-500" strokeWidth={2.5} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-7">
                    <a
                      href="#shd-consult"
                      onClick={() => closeRenewalModal()}
                      className="flex w-full items-center justify-center rounded-xl bg-[#da2527] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#b81e20] sm:text-sm"
                    >
                      Tư vấn miễn phí
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </FloatingLibraryProvider>
  );
}
