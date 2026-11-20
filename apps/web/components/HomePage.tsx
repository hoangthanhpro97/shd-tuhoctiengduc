'use client';

import { ArrowRight, Flame, Target, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getHomeData, selectHomeHighlights } from '../data/access';
import type { HomeData } from '../data/access';
import { useAuth } from './auth/AuthProvider';
import { DictationCard, ExamCard, ListeningCard, ReadingCard, SpeakingCard, WritingCard } from './Cards';
import { HeroQuickFilter } from './home/HeroQuickFilter';
import { StudentDashboard } from './home/StudentDashboard';

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

const dolFeatures = [
  { icon: '📖', iconClass: 'bg-purple-50 text-purple-600', title: 'Đề mô phỏng ÖSD, Goethe', description: 'Đề thi mô phỏng chuẩn định dạng khảo thí, kèm đáp án và phân tích bẫy tư duy chi tiết.', href: '/de-thi' },
  { icon: '🎧', iconClass: 'bg-blue-50 text-blue-600', title: 'Luyện tập Hören & Lesen', description: 'Kho bài luyện Nghe - Đọc phân cấp A1 đến B2 theo từng dạng bài và chủ đề thực tế.', href: '/luyen-nghe' },
  { icon: '✏️', iconClass: 'bg-amber-50 text-amber-600', title: 'Nghe chép chính tả (Diktat)', description: 'Luyện phản xạ bắt âm từng câu ngắt tự động, hỗ trợ nhận diện và sửa lỗi sai chính xác.', href: '/chep-chinh-ta' },
  { icon: '📝', iconClass: 'bg-emerald-50 text-emerald-600', title: 'Bài mẫu Schreiben & Sprechen', description: 'Tổng hợp bài mẫu song ngữ, dàn ý triển khai và danh mục mẫu câu Redemittel đắt giá.', href: '/bai-mau' },
] as const;

function GuestHome({ data, user }: { data: HomeData | null; user?: unknown }) {
  const [cookie, setCookie] = useState(true);
  return <>
    <main className="guest-home">
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#fde8e8]/85 via-[#fef2f2]/70 to-white pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pt-14" data-testid="hero-section">
        <div className="relative z-30 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="flex translate-y-10 flex-col justify-center sm:translate-y-12 lg:col-span-7 lg:translate-y-14">
            <h1 className="mb-4 text-3xl font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="block text-slate-900 xl:whitespace-nowrap">Nền tảng tự học</span>
              <span className="mt-1 block text-[#da2527] xl:whitespace-nowrap">Tiếng Đức Online - 4 kỹ năng</span>
              <span className="mt-1 block font-normal text-slate-700 xl:whitespace-nowrap">Miễn phí và chất lượng</span>
            </h1>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">SHD Tự Học Tiếng Đức cung cấp đầy đủ nội dung chất lượng gồm đề thi mô phỏng chuẩn ÖSD, Goethe &amp; TELC, luyện đề Lesen, Hören &amp; bài mẫu Schreiben, Sprechen kết hợp nghe chép chính tả Diktat được phát triển bởi SHD Education.</p>
            <div className="flex items-center gap-4">
              <Link className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#da2527] px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-[#b81e20] hover:shadow-lg" href="/de-thi">
                <span>{user ? 'Tiếp tục luyện đề ngay' : 'Đăng ký miễn phí ngay'}</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[360px] items-center justify-center lg:col-span-5 lg:flex" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20" id="explore">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-extrabold leading-[1.25] tracking-tight text-slate-900 sm:text-4xl lg:text-[42px]">Tự học Tiếng Đức <br />của <span className="text-[#da2527]">SHD</span> có gì<span className="ml-2 inline-block align-baseline text-5xl font-black text-[#da2527] lg:text-6xl">?</span></h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {dolFeatures.map((feature) => <div className="group flex flex-col items-start" data-testid="dol-feature-card" key={feature.title}>
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-transform group-hover:scale-110 ${feature.iconClass}`}>{feature.icon}</div>
              <h3 className="mb-1.5 text-lg font-bold text-slate-900 transition-colors group-hover:text-[#da2527]">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-snug line-clamp-2 mt-1 mb-2.5 sm:text-sm">{feature.description}</p>
              <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-[#da2527] transition-transform group-hover:translate-x-1" href={feature.href}><span>Khám phá</span><span>→</span></Link>
            </div>)}
          </div>
        </div>
      </section>

      <section className="my-10 lg:my-14">
         <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><HeroQuickFilter exams={data?.exams} /></div>
      </section>

      <div className="mx-auto max-w-7xl px-4 font-sans sm:px-6 lg:px-8">
         <HomeContent data={data} />
         <section className="contact-cta" id="contact"><div><div className="eyebrow">Không biết bắt đầu từ đâu?</div><h2>Để SHD giúp bạn chọn đúng <span>lộ trình.</span></h2><p>Làm bài kiểm tra nhanh và nhận gợi ý cấp độ, kỹ năng nên ưu tiên cùng tài liệu phù hợp.</p><a className="button button-primary" href="/de-thi">Làm test đầu vào <ArrowRight size={15} /></a></div><div className="collage"><div><Target size={20} /><br />Chọn mục tiêu</div><div><Trophy size={20} /><br />Theo dõi tiến bộ</div><div><Flame size={20} /><br />Duy trì thói quen</div></div></section>
       </div>
    </main>
    {cookie && <div className="cookie"><p>SHD dùng cookie cần thiết để lưu phiên học tập và cải thiện trải nghiệm.</p><button className="button button-primary" type="button" onClick={() => setCookie(false)}>Đã hiểu</button></div>}
  </>;
}

function HomeContent({ data }: { data: HomeData | null }) {
  if (!data) return <div className="home-loading" aria-label="Đang tải nội dung"><span /><span /><span /></div>;
  return <div className="home-content">
      <ContentSection id="exams" title="Đề thi mô phỏng ÖSD & Goethe" accent="" href="/de-thi/osd">{selectHomeHighlights(data.exams).map((exam) => <ExamCard exam={exam} key={exam.slug} />)}</ContentSection>
     <ContentSection id="listening" title="Luyện nghe" accent="Hören" href="/luyen-nghe/osd">{selectHomeHighlights(data.listening).map((item, index) => <ListeningCard item={item} itemKey={homepageListeningKeys[index]} key={item.slug ?? item.title} />)}</ContentSection>
     <ContentSection id="reading" title="Luyện đọc" accent="Lesen" href="/luyen-doc/osd">{selectHomeHighlights(data.reading).map((item, index) => <ReadingCard item={item} itemKey={homepageReadingKeys[index]} key={item.slug ?? item.title} />)}</ContentSection>
     <ContentSection id="speaking" title="Luyện nói" accent="Sprechen" href="/bai-mau-sprechen">{homepageSpeakingCards.slice(0, 4).map((item) => <SpeakingCard {...item} key={item.title} />)}</ContentSection>
     <ContentSection id="writing" title="Luyện viết" accent="Schreiben" href="/bai-mau-schreiben">{homepageWritingCards.slice(0, 4).map((item) => <WritingCard {...item} key={item.title} />)}</ContentSection>
     <ContentSection id="dictation" title="Chép chính tả" accent="Diktat" href="/chep-chinh-ta">{data.dictations.slice(0, 4).map((item, index) => <DictationCard item={item} itemKey={homepageDictationKeys[index]} key={item.title} />)}</ContentSection>
  </div>;
}

export function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  useEffect(() => { getHomeData().then(setData); }, []);
  return user ? <StudentDashboard data={data} user={user} /> : <GuestHome data={data} />;
}

function ContentSection({ id, title, accent, href, children }: { id: string; title: string; accent: string; href: string; children: React.ReactNode }) {
   return <section className="content-section py-5 sm:py-6" id={id}><div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-4"><h2 className="m-0 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}{accent && <> <span className="text-[#da2527]">{accent}</span></>}</h2><a className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-slate-500 hover:text-[#da2527] sm:text-sm" href={href}>Xem tất cả <ArrowRight size={14} /></a></div><div className="horizontal-scroll">{children}</div></section>;
}
