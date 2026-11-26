import Link from 'next/link';

export function SiteFooter() {
  const hotline = process.env.SITE_HOTLINE;
  const address = process.env.SITE_ADDRESS;

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#0f172a] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-black tracking-tight text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da2527] text-xs font-black text-white">
                SHD
              </span>
              <span>SHD Tự học tiếng Đức</span>
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              Nền tảng tự học tiếng Đức miễn phí thuộc SHD Education: luyện đề ÖSD, Goethe, TELC chuẩn khảo thí, phát triển 4 kỹ năng và nghe chép chính tả Diktat.
            </p>
            {hotline && <p className="mt-3 text-xs text-slate-400">Hotline: {hotline}</p>}
            {address && <p className="mt-1 text-xs text-slate-400">Địa chỉ: {address}</p>}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Luyện thi chuẩn Đức – Áo</h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li><Link href="/de-thi" className="transition-colors hover:text-white">Kho đề ÖSD &amp; Goethe Online-Test</Link></li>
              <li><Link href="/de-thi/goethe" className="transition-colors hover:text-white">Goethe-Zertifikat B1</Link></li>
              <li><Link href="/de-thi/osd" className="transition-colors hover:text-white">ÖSD Zertifikat B1 &amp; B2</Link></li>
              <li><Link href="/de-thi/telc" className="transition-colors hover:text-white">telc Deutsch (A1–B2)</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Rèn 4 kỹ năng</h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li><Link href="/luyen-nghe" className="transition-colors hover:text-white">Luyện nghe Hören</Link></li>
              <li><Link href="/luyen-doc" className="transition-colors hover:text-white">Luyện đọc Lesen</Link></li>
              <li><Link href="/chep-chinh-ta" className="transition-colors hover:text-white">Nghe chép Diktat</Link></li>
              <li><Link href="/bai-mau" className="transition-colors hover:text-white">Bài mẫu Schreiben &amp; Sprechen</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Học tập &amp; Tài khoản</h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li><Link href="/hoc-tap" className="transition-colors hover:text-white">Không gian học tập</Link></li>
              <li><Link href="/tai-khoan" className="transition-colors hover:text-white">Tiến độ &amp; Lịch sử</Link></li>
              <li><Link href="/tai-khoan-pro" className="transition-colors hover:text-white">Gia hạn miễn phí</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <span>© 2026 SHD Education. Phát triển cho cộng đồng tự học tiếng Đức.</span>
          <div className="flex items-center gap-4">
            <Link href="/de-thi" className="hover:text-slate-300">Chính sách bảo mật</Link>
            <Link href="/tai-khoan" className="hover:text-slate-300">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
