'use client';

import { usePathname } from 'next/navigation';
import { shouldShowPromoBanners } from '../../lib/banner-visibility';

export function FloatingSupportBar() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const pathname = usePathname();
  if (!shouldShowPromoBanners(pathname)) return null;

  return <aside aria-label="Hỗ trợ học viên trực tuyến" className="fixed bottom-24 right-3 z-40 flex select-none flex-col items-end gap-2 sm:bottom-8 sm:right-3.5 sm:gap-2.5">
    <a href="#shd-consult" className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:-translate-x-1 hover:bg-emerald-700 sm:flex"><span>🇩🇪 Du học nghề &amp; 18b</span></a>
    <a href="/de-thi" className="hidden items-center gap-1.5 rounded-full bg-[#da2527] px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:-translate-x-1 hover:bg-[#b81e20] sm:flex"><span>🎯 Lộ trình chuẩn ÖSD</span></a>
    <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 sm:h-11 sm:w-11 sm:text-xs" title="Chat Zalo với Cố vấn Học thuật SHD">Zalo</a>
    <button type="button" onClick={scrollToTop} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:bg-slate-100 sm:h-10 sm:w-10" title="Lên đầu trang" aria-label="Lên đầu trang"><svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m5 15 7-7 7 7" /></svg></button>
  </aside>;
}
