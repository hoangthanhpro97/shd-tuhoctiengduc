'use client';

import { Check, Copy, Download, ExternalLink, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { ExamPublicPayload } from '@shd/contracts';
import { examBookSets, type ExamBookSet } from '../../data/exam-book-sets';
import { useAuth } from '../auth/AuthProvider';
import { AuthModal } from '../auth/AuthModal';
import { ExamBookCover } from './ExamBookCover';
import { ExamSectionMatrix } from './ExamSectionMatrix';
import { ExamSiblingSlider } from './ExamSiblingSlider';

type TestRow = { canonicalSlug: string; exam: ExamPublicPayload };

function testNumber(slug: string) {
  return (slug.match(/(\d+)$/)?.[1] ?? '01').padStart(2, '0');
}

function RelatedBookCard({ bookSet }: { bookSet: ExamBookSet }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Link href={`/de-thi/${bookSet.slug}`} className="group relative h-36 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100" aria-label={`Mở ${bookSet.title}`}>
        <div className="origin-top-left scale-[0.68]">
          <ExamBookCover
            className="h-52 w-36 rounded-xl"
            level={bookSet.level}
            provider="osd"
            simulationNumber={bookSet.volumeNumber}
            stageClassName={bookSet.level === 'B1' ? 'bg-sky-100/80' : 'bg-rose-100/75'}
            title={bookSet.title}
          />
        </div>
      </Link>
      <div className="min-w-0 self-stretch py-1">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900">{bookSet.title}</h3>
        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-500">{bookSet.description}</p>
        <Link href={`/de-thi/${bookSet.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[#da2527] hover:text-[#b81e20]">
          Xem bài test <ExternalLink size={12} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ExamDetailView({ exam, requestedSlug, bookSet, tests }: { exam: ExamPublicPayload; requestedSlug: string; bookSet: ExamBookSet | null; tests: TestRow[] }) {
  const { user, ready } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pdfMessage, setPdfMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const title = bookSet?.title ?? exam.examMetadata.title;
  const canonicalActive = tests.find((test) => test.exam.examMetadata.slug === exam.examMetadata.slug)?.canonicalSlug
    ?? (bookSet && requestedSlug === bookSet.slug ? bookSet.examSlugs[0] : requestedSlug);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access is optional in locked-down browsers.
    }
  };
  const downloadPdf = () => {
    if (!user) {
      setPdfMessage(true);
      setAuthOpen(true);
      return;
    }
    window.open(`/de-thi/${bookSet?.slug ?? requestedSlug}/de-va-dap-an?skill=lesen&print=1`, '_blank', 'noopener,noreferrer');
  };
  const testCount = tests.length || bookSet?.examSlugs.length || 1;
  const academicDescription = `${title} với ${testCount} đề thi ÖSD Lesen & Hören được thiết kế chuẩn định dạng Viện Khảo thí ÖSD Áo dưới dạng bài thi thử Online-Test kèm Answer Key, giải thích chi tiết bằng phương pháp độc quyền SHD Kontext-Methode, danh sách từ vựng trọng tâm (Wortschatz) và Free PDF Download.`;

  return (
    <main className="min-h-screen overflow-x-clip bg-gradient-to-b from-[#fde8e8]/70 via-[#fef2f2]/45 to-white pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#da2527]">Trang chủ</Link>
          <span aria-hidden="true">&gt;</span>
          <Link href="/de-thi" className="hover:text-[#da2527]">ÖSD &amp; Goethe Online-Test</Link>
          <span aria-hidden="true">&gt;</span>
          <Link href="/de-thi/osd" className="hover:text-[#da2527]">ÖSD Online-Test</Link>
          <span aria-hidden="true">&gt;</span>
          <span className="min-w-0 truncate font-bold text-slate-900" aria-current="page">{title}</span>
        </nav>

        {bookSet && <ExamSiblingSlider bookSet={bookSet} />}

        <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <section className="min-w-0 lg:col-span-8">
            <div className="grid min-w-0 gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
              <div className="h-52 w-32 overflow-hidden rounded-2xl bg-white/60 sm:w-36" aria-label={`Bìa ${title}`}>
                <div className="origin-top-left scale-[0.88]">
                  <ExamBookCover
                    className="h-52 w-36 rounded-2xl"
                    level={exam.examMetadata.cefrLevel === 'C1' ? 'B2' : exam.examMetadata.cefrLevel}
                    provider="osd"
                    simulationNumber={bookSet ? bookSet.volumeNumber : testNumber(canonicalActive)}
                    stageClassName="bg-white/65"
                    title={title}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0284c7]">ÖSD Zertifikat {exam.examMetadata.cefrLevel}</p>
                <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
                <p className="mt-3 text-xs font-bold leading-relaxed text-slate-600 sm:text-sm">{testCount} bài test · 2 kỹ năng Lesen &amp; Hören · {exam.examMetadata.passPercentage}% đạt</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Chia sẻ</span>
                  <button type="button" onClick={share} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:border-[#da2527] hover:text-[#da2527]">
                    {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />} {copied ? 'Đã sao chép' : 'Sao chép link'}
                  </button>
                  <button type="button" onClick={downloadPdf} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-[#da2527] transition-colors hover:border-[#da2527] hover:bg-rose-50"><Download size={13} /> Free PDF Download {!user && <LockKeyhole size={11} />}</button>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">{academicDescription}</p>
              </div>
            </div>
            <ExamSectionMatrix tests={tests} activeSlug={canonicalActive} />
          </section>

          <aside className="min-w-0 lg:col-span-4 lg:sticky lg:top-24">
            {!ready || !user ? (
              <section className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-100 via-[#fff8ed] to-sky-100/80 p-6 shadow-sm" aria-labelledby="exam-registration-title">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#da2527]"><LockKeyhole size={18} /></span>
                <h2 id="exam-registration-title" className="mt-4 text-xl font-extrabold text-slate-900">Lưu tiến độ làm bài</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Đăng ký miễn phí để lưu bài đang làm, xem lịch sử và tiếp tục trên mọi thiết bị.</p>
                <button type="button" onClick={() => setAuthOpen(true)} aria-haspopup="dialog" className="mt-5 w-full rounded-xl bg-[#da2527] py-3 text-sm font-bold text-white transition-colors hover:bg-[#b81e20]">Đăng ký miễn phí ngay</button>
              </section>
            ) : (
              <section className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-100 via-[#fff8ed] to-sky-100/80 p-6 shadow-sm" aria-labelledby="exam-renew-title">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Tài khoản {user.plan}</p>
                <h2 id="exam-renew-title" className="mt-2 text-xl font-extrabold text-slate-900">Gia hạn &amp; Lộ trình miễn phí</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Giữ nhịp học, lưu tiến độ và nhận lộ trình ôn thi phù hợp với mục tiêu của bạn.</p>
                <Link href="/tai-khoan-pro" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#da2527] py-3 text-sm font-bold text-white transition-colors hover:bg-[#b81e20]">Gia hạn miễn phí ngay</Link>
              </section>
            )}

          </aside>
        </div>
      </div>
      <section className="mx-auto mt-14 mb-16 max-w-6xl px-4" aria-labelledby="related-books-title">
        <h2 id="related-books-title" className="mb-6 text-xl font-extrabold text-slate-900 sm:text-2xl">Sách cùng bộ ÖSD Zertifikat</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {examBookSets.map((set) => <RelatedBookCard key={set.slug} bookSet={set} />)}
        </div>
      </section>
      {authOpen && <AuthModal message={pdfMessage ? 'Đăng ký miễn phí để tải trọn bộ đề PDF & danh sách từ vựng' : undefined} onClose={() => { setAuthOpen(false); setPdfMessage(false); }} />}
    </main>
  );
}
