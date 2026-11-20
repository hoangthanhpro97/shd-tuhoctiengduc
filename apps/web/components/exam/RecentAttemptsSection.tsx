'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import type { PublicExamListItem } from './ExamCatalog';

type AttemptHistoryItem = {
  attemptId: string;
  slug: string;
  title: string;
  status: 'in_progress' | 'submitted' | 'graded';
  mode: 'exam' | 'practice';
  answeredCount: number;
  totalQuestions: number;
  startedAt: string;
};

function progressLabel(attempt: AttemptHistoryItem) {
  if (!attempt.totalQuestions) return 'Đang làm';
  return `${attempt.answeredCount}/${attempt.totalQuestions} câu`;
}

export function RecentAttemptsSection({ exams }: { exams: PublicExamListItem[] }) {
  const { user, ready } = useAuth();
  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    fetch('/api/v1/attempts?limit=20', { cache: 'no-store' })
      .then(async (response) => response.ok ? (await response.json() as { items?: AttemptHistoryItem[] }).items ?? [] : [])
      .then((items) => { if (!cancelled) setAttempts(items); })
      .catch(() => { if (!cancelled) setAttempts([]); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [ready, user]);

  if (!user) return null;
  if (!ready || !loaded) return null;

  const attemptBySlug = new Map([...attempts].reverse().map((attempt) => [attempt.slug, attempt]));
  const latest = exams.slice(0, 6);
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4" aria-labelledby="recent-attempts-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#da2527]">SHD Learning Space</p>
          <h2 id="recent-attempts-title" className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Bài test mới nhất</h2>
        </div>
        {attempts.length > 0 && <Link href="/tai-khoan#history" className="text-xs font-bold text-[#da2527]">Xem toàn bộ lịch sử →</Link>}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
        {latest.map((exam) => {
          const attempt = attemptBySlug.get(exam.slug);
          const href = attempt?.status === 'in_progress' ? `/lam-bai/${attempt.attemptId}` : attempt ? `/ket-qua/${attempt.attemptId}` : `/de-thi/${exam.slug}`;
          const label = attempt?.status === 'in_progress' ? '▶ Làm tiếp →' : attempt ? 'Xem kết quả →' : '▶ Làm bài →';
          return (
            <article key={exam.slug} className="rounded-xl border border-slate-100 bg-white py-1">
              <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900">{exam.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{exam.sectionCount} phần thi · {exam.durationMinutes} phút · {exam.passPercentage ?? 60}% đạt</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {attempt?.status === 'in_progress' && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Tiến độ {progressLabel(attempt)}</span>}
                <Link href={href} className="text-xs font-bold text-[#da2527]">{label}</Link>
              </div>
            </article>
          );
        })}
      </div>
      {attempts.length > 0 && (
        <div className="mt-7 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-extrabold text-slate-900">Lịch sử làm bài gần đây</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {attempts.slice(0, 4).map((attempt) => (
              <Link key={attempt.attemptId} href={attempt.status === 'in_progress' ? `/lam-bai/${attempt.attemptId}` : `/ket-qua/${attempt.attemptId}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-rose-50">
                <span className="min-w-0"><strong className="block truncate text-xs text-slate-900">{attempt.title}</strong><small className="mt-1 block text-[11px] text-slate-500">{attempt.status === 'in_progress' ? `Đang làm · ${progressLabel(attempt)}` : 'Đã nộp bài'} · {attempt.mode === 'practice' ? 'Luyện tập' : 'Thi thử'}</small></span>
                <span className="shrink-0 text-xs font-bold text-[#da2527]">{attempt.status === 'in_progress' ? 'Làm tiếp →' : 'Xem kết quả →'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
