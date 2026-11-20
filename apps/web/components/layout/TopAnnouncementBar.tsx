'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { shouldShowGlobalAnnouncementBar, shouldShowHeroAnnouncementBar } from '../../lib/banner-visibility';

export function TopAnnouncementBar({ placement = 'global' }: { placement?: 'global' | 'hero' }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const allowed = placement === 'hero'
    ? shouldShowHeroAnnouncementBar(pathname)
    : shouldShowGlobalAnnouncementBar(pathname);

  if (!allowed) return null;

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return <div className={placement === 'hero' ? 'pointer-events-none absolute inset-x-0 top-0 z-20' : 'announcement-overlay pointer-events-none'} data-testid="announcement-slot">
    <aside aria-hidden={!isVisible} aria-label="Thông báo tuyển sinh khóa học" className={`w-full bg-[#fef6ee] transition-opacity duration-300 ${isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} data-testid="announcement-bar">
      <div className="mx-auto flex items-center justify-between px-4 py-2.5 text-xs sm:py-3 sm:text-sm lg:px-8">
        <div className="mx-auto flex min-w-0 items-center gap-2.5">
          <div className="relative shrink-0">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" alt="Giáo viên SHD" className="h-11 w-11 shrink-0 rounded-full object-cover shadow-xs ring-2 ring-orange-200/80 sm:h-12 sm:w-12" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">✨</span>
          </div>
          <div className="truncate font-medium text-slate-800">
            <span>SHD Education khai giảng các lớp Tiếng Đức Cấp tốc &amp; Tiêu chuẩn (A1 – B2) tại cơ sở Bình Thạnh &amp; Online. Tặng kèm buổi học với Giáo viên bản ngữ! </span>
            <Link className="ml-1.5 inline-flex items-center gap-1 font-bold text-[#da2527] hover:underline" href="/de-thi"><span>Xem lịch khai giảng</span><span>→</span></Link>
          </div>
        </div>
        <button type="button" onClick={handleDismiss} className="ml-2 shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700" aria-label="Đóng thông báo">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </aside>
  </div>;
}
