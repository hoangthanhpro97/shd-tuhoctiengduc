'use client';

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
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
import { selectHomeHighlights } from '../../data/access';
import {
  DictationCard,
  ExamCard,
  ListeningCard,
  ReadingCard,
  SpeakingCard,
  WritingCard,
} from '../Cards';

const skillNavCards = [
  {
    title: 'ÖSD & Goethe Online-Test',
    href: '/de-thi',
    bgImage:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Luyện nghe Hören',
    href: '/luyen-nghe',
    bgImage:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Luyện đọc Lesen',
    href: '/luyen-doc',
    bgImage:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Chép Chính Tả Diktat',
    href: '/chep-chinh-ta',
    bgImage:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Bài mẫu Schreiben',
    href: '/bai-mau-schreiben',
    bgImage:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=640&q=80',
  },
  {
    title: 'Bài mẫu Sprechen',
    href: '/bai-mau-sprechen',
    bgImage:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80',
  },
] as const;

const recentLessons = [
  {
    id: 'recent-1',
    title: 'ÖSD B1 · Modelltest 01 – Lesen Teil 1',
    category: 'ÖSD Online-Test',
    categoryClass: 'bg-red-50 text-[#da2527] border-red-200/60',
    progress: 24,
    statusText: 'Đang làm dở · Câu 04/30',
    timeAgo: '15 phút trước',
    href: '/lam-bai/local-osd-b1-mock-01-exam-lesen-1794838978263-eeef8e?auth=1',
    actionText: 'Làm tiếp',
    isComplete: false,
  },
  {
    id: 'recent-2',
    title: 'Kurze Alltagsansagen – Hören Teil 1',
    category: 'Luyện nghe Hören',
    categoryClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    progress: 60,
    statusText: 'Đang làm dở · 3/5 câu',
    timeAgo: 'Hôm nay',
    href: '/luyen-nghe/osd-b1-mock-01-hoeren-1',
    actionText: 'Làm tiếp',
    isComplete: false,
  },
  {
    id: 'recent-3',
    title: 'Am Arbeitsplatz – Diktat A2',
    category: 'Chép chính tả',
    categoryClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    progress: 100,
    statusText: 'Đã hoàn thành · 100%',
    timeAgo: 'Hôm qua',
    href: '/chep-chinh-ta/diktat-a2-am-arbeitsplatz',
    actionText: 'Luyện lại',
    isComplete: true,
  },
];

const homepageSpeakingCards = [
  { title: 'Goethe B1 Teil 1', provider: 'Goethe B1', part: 'Teil 1', itemKey: 'goethe-b1-teil-1', href: '/bai-mau-sprechen/goethe-b1-teil-1-party-planen' },
  { title: 'Goethe B1 Teil 2', provider: 'Goethe B1', part: 'Teil 2', itemKey: 'goethe-b1-teil-2', href: '/bai-mau-sprechen/goethe-b1-teil-2-kinder-und-mobiltelefone' },
  { title: 'ÖSD ZDÖ B1 Teil 1', provider: 'ÖSD ZDÖ B1', part: 'Teil 1', itemKey: 'osd-zdo-b1-teil-1', href: '/bai-mau-sprechen/osd-zdo-b1-teil-1-kennenlernen' },
  { title: 'Goethe B2 Teil 1', provider: 'Goethe B2', part: 'Teil 1', itemKey: 'goethe-b2-teil-1', href: '/bai-mau-sprechen' },
];

const homepageWritingCards = [
  { title: 'Goethe B1 Aufgabe 1', provider: 'Goethe B1', part: 'Aufgabe 1', itemKey: 'goethe-b1-aufgabe-1', href: '/bai-mau-schreiben/goethe-b1-aufgabe-1-ausflug-nach-da-lat' },
  { title: 'Goethe B1 Aufgabe 2', provider: 'Goethe B1', part: 'Aufgabe 2', itemKey: 'goethe-b1-aufgabe-2', href: '/bai-mau-schreiben/goethe-b1-aufgabe-2-handys-in-der-schule' },
  { title: 'Goethe B1 Aufgabe 3', provider: 'Goethe B1', part: 'Aufgabe 3', itemKey: 'goethe-b1-aufgabe-3', href: '/bai-mau-schreiben/goethe-b1-aufgabe-3-termin-verschieben' },
  { title: 'ÖSD B1 Schreiben', provider: 'ÖSD B1', part: 'Schreiben', itemKey: 'osd-b1-schreiben', href: '/bai-mau-schreiben/osd-zdo-b1-schreiben-kursbeginn' },
];

const homepageListeningKeys = ['thong-bao-nha-ga', 'mot-ngay-di-lam', 'hen-gap-cuoi-tuan', 'lop-hoc-buoi-toi'];
const homepageReadingKeys = ['lich-hoc-cua-ban', 'thong-tin-tuyen-dung', 'loi-moi', 'tin-nhan-trong-ngay'];
const homepageDictationKeys = ['im-alltag', 'am-arbeitsplatz', 'in-der-stadt', 'gute-gewohnheiten'];

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

  // Carousel scroll ref & state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Renewal modal state (with mount/animate flags for smooth enter & exit)
  const [renewalMounted, setRenewalMounted] = useState(false);
  const [renewalVisible, setRenewalVisible] = useState(false);

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
    <main className="student-dashboard min-h-screen bg-[#f8fafc] pb-20 font-sans">
      {/* ================= VÙNG NỀN ĐỎ PASTEL BLUR NHẸ (#da2527) ĐỒNG BỘ TRANG CHỦ ================= */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#fde8e8]/90 via-[#fef2f2]/75 to-[#f8fafc]">
        {/* Soft blurred pastel brand-red radial ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 h-[320px] w-[960px] -translate-x-1/2 rounded-full bg-[#da2527]/[0.11] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-16 h-[220px] w-[360px] rounded-full bg-[#da2527]/[0.07] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 h-[240px] w-[380px] rounded-full bg-[#da2527]/[0.06] blur-3xl"
        />

        {/* Khoảng đệm trên >= 96px để TopAnnouncementBar (height 72px) tuyệt đối không che mất Tầng 1 */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-[96px] sm:px-6 sm:pt-[104px] lg:px-8">
          {/* ================= 1. HÀNG QUICK SKILL CAROUSEL (CHUẨN ẢNH SỐ 5) ================= */}
          <section className="relative" aria-label="Điều hướng nhanh kỹ năng">
            {/* Nút mũi tên trượt sang trái */}
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Trượt sang trái"
              className={`absolute -left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-md transition-all duration-200 hover:border-[#da2527]/40 hover:text-[#da2527] hover:shadow-lg sm:-left-4 sm:h-10 sm:w-10 ${
                canScrollLeft ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              <ChevronLeft size={19} strokeWidth={2.4} />
            </button>

            {/* Dãy thẻ kỹ năng: Chỉ có ảnh nền + tiêu đề căn giữa, ẩn hoàn toàn thanh cuộn ngang */}
            <div
              ref={carouselRef}
              onScroll={updateScrollButtons}
              className="no-scrollbar flex items-stretch gap-3.5 overflow-x-auto scroll-smooth py-1.5 sm:gap-4"
            >
              {skillNavCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative flex h-[86px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-xl px-5 text-center shadow-sm ring-1 ring-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-[#da2527]/70 sm:h-[92px] sm:w-[272px]"
                >
                  <img
                    src={card.bgImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Lớp phủ tối giúp tiêu đề trắng nổi bật, rõ nét */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/55 to-slate-900/45 transition-opacity duration-200 group-hover:from-slate-950/65 group-hover:via-slate-900/45"
                  />
                  <span className="relative z-10 whitespace-normal break-words text-center text-[15px] font-bold leading-snug text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] sm:text-[17px]">
                    {card.title}
                  </span>
                </Link>
              ))}
            </div>

            {/* Nút mũi tên trượt sang phải */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Trượt sang phải"
              className={`absolute -right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-md transition-all duration-200 hover:border-[#da2527]/40 hover:text-[#da2527] hover:shadow-lg sm:-right-4 sm:h-10 sm:w-10 ${
                canScrollRight ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              <ChevronRight size={19} strokeWidth={2.4} />
            </button>
          </section>

          {/* ================= 2. KHỐI BÀI LÀM GẦN ĐÂY (CHUẨN DOL) ================= */}
          <section className="mt-8 pb-2 sm:mt-10" aria-label="Bài làm gần đây">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#da2527]">
                  <Clock size={13} />
                  <span>Tiếp tục học tập</span>
                </div>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Bài làm gần đây
                </h2>
              </div>
              <Link
                href="/tai-khoan"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-[#da2527] sm:text-sm"
              >
                <span>Xem lịch sử</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentLessons.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${item.categoryClass}`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.timeAgo}
                      </span>
                    </div>

                    <h3 className="mt-2.5 line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-[#da2527] sm:text-base">
                      {item.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{item.statusText}</span>
                      <span className="font-bold text-slate-700">{item.progress}%</span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isComplete ? 'bg-emerald-500' : 'bg-[#da2527]'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-1 sm:text-sm"
                    >
                      {item.isComplete ? (
                        <>
                          <RotateCcw size={13} />
                          <span>{item.actionText}</span>
                        </>
                      ) : (
                        <>
                          <span>{item.actionText}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ================= PHẦN NỘI DUNG CHÍNH BÊN DƯỚI ================= */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= 3. BANNER GIA HẠN MIỄN PHÍ LẦN 1 (MỞ MODAL ANIMATION) ================= */}
        <section className="my-7 sm:my-8" aria-label="Gia hạn học tập">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#fed7d7] bg-gradient-to-r from-[#fff5f5] via-[#fff1f2] to-[#fef2f2] p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#da2527] text-white">
                  <Sparkles size={13} />
                </span>
                <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                  Gia hạn miễn phí!
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Chào {firstName}, nhận thêm 30 ngày sử dụng không giới hạn toàn bộ đề thi mô phỏng và bài luyện 4 kỹ năng tiếng Đức hoàn toàn miễn phí.
              </p>
            </div>
            <button
              type="button"
              onClick={openRenewalModal}
              data-testid="renewal-trigger-top"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#da2527] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#b81e20] hover:shadow-md active:scale-[0.98] sm:text-sm"
            >
              <span>Gia hạn miễn phí</span>
            </button>
          </div>
        </section>

        {/* ================= 4. CÁC HÀNG BÀI HỌC THEO KỸ NĂNG (CHUẨN DOL) ================= */}
        <div className="space-y-4 sm:space-y-6">
          <SkillContentSection
            id="exams"
            title="Đề thi mô phỏng"
            accent="ÖSD & Goethe"
            href="/de-thi/osd"
          >
            {data
              ? selectHomeHighlights(data.exams).map((exam) => (
                  <ExamCard exam={exam} key={exam.slug} />
                ))
              : <LoadingSkeleton />}
          </SkillContentSection>

          <SkillContentSection
            id="listening"
            title="Luyện nghe"
            accent="Hören"
            href="/luyen-nghe/osd"
          >
            {data
              ? selectHomeHighlights(data.listening).map((item, index) => (
                  <ListeningCard
                    item={item}
                    itemKey={homepageListeningKeys[index]}
                    key={item.slug ?? item.title}
                  />
                ))
              : <LoadingSkeleton />}
          </SkillContentSection>

          <SkillContentSection
            id="reading"
            title="Luyện đọc"
            accent="Lesen"
            href="/luyen-doc/osd"
          >
            {data
              ? selectHomeHighlights(data.reading).map((item, index) => (
                  <ReadingCard
                    item={item}
                    itemKey={homepageReadingKeys[index]}
                    key={item.slug ?? item.title}
                  />
                ))
              : <LoadingSkeleton />}
          </SkillContentSection>

          <SkillContentSection
            id="dictation"
            title="Chép chính tả"
            accent="Diktat"
            href="/chep-chinh-ta"
          >
            {data
              ? data.dictations
                  .slice(0, 4)
                  .map((item, index) => (
                    <DictationCard
                      item={item}
                      itemKey={homepageDictationKeys[index]}
                      key={item.title}
                    />
                  ))
              : <LoadingSkeleton />}
          </SkillContentSection>

          <SkillContentSection
            id="writing"
            title="Bài mẫu"
            accent="Schreiben"
            href="/bai-mau-schreiben"
          >
            {homepageWritingCards.slice(0, 4).map((item) => (
              <WritingCard {...item} key={item.title} />
            ))}
          </SkillContentSection>

          <SkillContentSection
            id="speaking"
            title="Bài mẫu"
            accent="Sprechen"
            href="/bai-mau-sprechen"
          >
            {homepageSpeakingCards.slice(0, 4).map((item) => (
              <SpeakingCard {...item} key={item.title} />
            ))}
          </SkillContentSection>
        </div>

        {/* ================= 5. BANNER GIA HẠN MIỄN PHÍ LẦN 2 ================= */}
        <section className="my-8 sm:my-10" aria-label="Gia hạn học tập lần 2">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#fed7d7] bg-gradient-to-r from-[#fff5f5] via-[#fff1f2] to-[#fef2f2] p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                Gia hạn miễn phí!
              </h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Tận hưởng lộ trình ôn luyện chuẩn khảo thí ÖSD &amp; Goethe, không lo gián đoạn chuỗi ngày học của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={openRenewalModal}
              data-testid="renewal-trigger-bottom"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#da2527] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#b81e20] hover:shadow-md active:scale-[0.98] sm:text-sm"
            >
              <span>Gia hạn miễn phí</span>
            </button>
          </div>
        </section>

        {/* ================= 6. SECTION TEST ĐẦU VÀO & TƯ VẤN (NỀN ĐỎ THƯƠNG HIỆU NỔI BẬT) ================= */}
        <section
          className="relative my-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#da2527] via-[#c41e20] to-[#961416] p-6 text-white shadow-xl shadow-[#da2527]/15 sm:p-8 lg:p-11"
          id="shd-consult"
          aria-label="Tư vấn đầu vào SHD"
        >
          {/* Decorative brand-glow blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#fde047]/15 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Cột trái: Thông tin & Hotline chuẩn (+84-28) 6276 0276 */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                <span>SHD Education</span>
              </div>
              <h2 className="mt-3.5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                Đăng ký test đầu vào Tiếng Đức{' '}
                <span className="text-[#fde047]">miễn phí</span> và nhận tư vấn
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-red-50/90 sm:text-sm">
                Làm bài test đánh giá toàn diện 4 kỹ năng và nhận tư vấn định hướng lộ trình học cấp tốc A1 – B2 chuẩn ÖSD, Goethe hoặc Du học nghề Đức từ cố vấn chuyên môn SHD.
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href="tel:+842862760276"
                  className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/15 sm:text-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#da2527] shadow-xs">
                    <Phone size={17} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-red-100/90">
                      Hotline tư vấn học thuật
                    </span>
                    <span className="text-sm font-extrabold tracking-wide text-white">
                      (+84-28) 6276 0276
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-xs sm:text-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#da2527] shadow-xs">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-red-100/90">
                      Cơ sở đào tạo
                    </span>
                    <span>Bình Thạnh, TP. Hồ Chí Minh &amp; Lớp Online</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/de-thi"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-extrabold text-[#da2527] shadow-md transition-all hover:bg-red-50 hover:shadow-lg sm:text-sm"
                >
                  <span>Làm test đầu vào ngay</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Cột phải: Mosaic collage ảnh thực tế học viên / cơ sở vật chất SHD */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/25">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=640&q=80"
                      alt="Lớp học tiếng Đức SHD"
                      className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-52"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/25">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80"
                      alt="Nhóm học viên tự học tiếng Đức"
                      className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-40"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                  <div className="overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/25">
                    <img
                      src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=640&q=80"
                      alt="Buổi thảo luận Sprechen cùng giáo viên"
                      className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-40"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/25">
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

      {/* ================= MODAL "GIA HẠN MIỄN PHÍ" ANIMATION MƯỢT (CHUẨN ẢNH SỐ 7) ================= */}
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
              renewalVisible
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-4 scale-95 opacity-0'
            }`}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="renewal-modal-title"
                  className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                >
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

            {/* 2 Cột so sánh gói học chuẩn mẫu ảnh số 7 */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Cột trái: Người dùng */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div>
                  <div className="flex justify-end">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <User size={20} />
                    </span>
                  </div>
                  <div className="mt-2 text-right text-sm font-medium text-slate-500">
                    Người dùng
                  </div>
                  <div className="mt-1.5 text-right text-2xl font-extrabold tracking-tight text-slate-900">
                    299.000đ/ 1tháng
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {standardPlanFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-700 sm:text-[13px]"
                      >
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

              {/* Cột phải: Học viên SHD (Viền đỏ thương hiệu #da2527 nổi bật) */}
              <div className="flex flex-col justify-between rounded-2xl border-[1.5px] border-[#da2527] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <div className="flex justify-end">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da2527] text-[10px] font-black tracking-tight text-white shadow-xs">
                      SHD
                    </span>
                  </div>
                  <div className="mt-2 text-right text-sm font-semibold text-slate-700">
                    Học viên SHD
                  </div>
                  <div className="mt-1.5 text-right text-2xl font-extrabold tracking-tight text-slate-900">
                    Miễn Phí
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {shdStudentPlanFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-700 sm:text-[13px]"
                      >
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
                    className="flex w-full items-center justify-center rounded-xl bg-[#da2527] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#b81e20] hover:shadow-md sm:text-sm"
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
  );
}

function SkillContentSection({
  id,
  title,
  accent,
  href,
  children,
}: {
  id: string;
  title: string;
  accent: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="content-section py-4 sm:py-5" id={id}>
      <div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-4">
        <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
          {accent && (
            <>
              {' '}
              <span className="text-[#da2527]">{accent}</span>
            </>
          )}
        </h2>
        <Link
          className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-slate-500 transition-colors hover:text-[#da2527] sm:text-sm"
          href={href}
        >
          <span>Xem tất cả</span>
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="horizontal-scroll">{children}</div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-48 w-56 shrink-0 animate-pulse rounded-2xl bg-slate-200/60"
        />
      ))}
    </div>
  );
}
