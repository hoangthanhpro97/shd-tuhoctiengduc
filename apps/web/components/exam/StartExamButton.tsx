'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AttemptMode } from '@shd/contracts';

type StartExamButtonProps = {
  slug: string;
  mode?: AttemptMode;
  sectionFilter?: 'lesen' | 'hoeren' | 'all';
  label?: ReactNode;
  variant?: 'primary' | 'link' | 'menu' | 'split-main';
  buttonClassName?: string;
  resumeAttemptId?: string;
  resumeLabel?: ReactNode;
};

const variantClasses: Record<NonNullable<StartExamButtonProps['variant']>, string> = {
  primary: 'button button-primary',
  link: 'inline-flex max-w-full items-center text-left text-xs font-extrabold text-slate-900 transition-colors hover:text-[#da2527]',
  menu: 'flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#da2527]',
  'split-main': 'inline-flex min-h-9 items-center gap-1 px-3 text-xs font-bold text-[#da2527] transition-colors hover:bg-rose-50 hover:text-[#b81e20]',
};

export function StartExamButton({ slug, mode = 'exam', sectionFilter = 'all', label, variant = 'primary', buttonClassName, resumeAttemptId, resumeLabel }: StartExamButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function start() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/attempts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, mode, sectionFilter }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? 'Không thể bắt đầu bài thi.');
      router.push(`/lam-bai/${payload.attemptId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể bắt đầu bài thi.');
      setBusy(false);
    }
  }
  const actionLabel = busy ? 'Đang tạo phiên...' : label ?? (mode === 'practice' ? 'Bắt đầu luyện tập' : 'Bắt đầu thi thử');
  const actionClassName = `${variantClasses[variant]}${buttonClassName ? ` ${buttonClassName}` : ''}`;

  return (
    <div className="start-exam-action">
      {resumeAttemptId ? (
        <Link className={actionClassName} href={`/lam-bai/${resumeAttemptId}`}>
          {resumeLabel ?? label ?? 'Làm tiếp'}
        </Link>
      ) : (
        <button className={actionClassName} type="button" disabled={busy} onClick={start}>{actionLabel}</button>
      )}
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
