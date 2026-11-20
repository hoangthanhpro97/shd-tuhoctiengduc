'use client';

import { Bell, BookOpen, CheckCheck, ChevronDown, Clock, Flame, Menu, Search, Sparkles, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import copy from '../content/ui-copy.vi.json';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from './auth/AuthProvider';
import { MobileNavigation } from './MobileNavigation';
import { TopAnnouncementBar } from './layout/TopAnnouncementBar';
import { shouldShowGlobalAnnouncementBar } from '../lib/banner-visibility';

type LinkItem = { label: string; href: string; description?: string };
type MenuColumn = { title: string; href?: string; links: LinkItem[] };

const examColumns: MenuColumn[] = [
  { title: 'GOETHE', href: '/de-thi/goethe', links: [{ label: 'Goethe B1', href: '/de-thi/goethe#b1', description: 'Modellsatz B1 · 4 Teil' }, { label: 'Goethe B2', href: '/de-thi/goethe#b2', description: 'Modellsatz B2 · Full Mock Test' }] },
  { title: 'ÖSD', href: '/de-thi/osd', links: [{ label: 'ÖSD B1', href: '/de-thi/osd#b1', description: 'Zertifikat B1 · ZB1 / ZDÖ' }, { label: 'ÖSD B2', href: '/de-thi/osd#b2', description: 'Chuẩn Áo' }] },
  { title: 'TELC', href: '/de-thi/telc', links: [{ label: 'TELC B1', href: '/de-thi/telc#b1', description: 'Übungstest B1 · Trắc nghiệm' }, { label: 'TELC B2', href: '/de-thi/telc#b2', description: 'Thi công việc' }] },
];

const practiceColumns: MenuColumn[] = [
  { title: 'GOETHE', href: '/luyen-nghe/goethe', links: [{ label: 'Goethe B1', href: '/luyen-nghe/goethe#b1', description: 'Transcript song ngữ' }, { label: 'Goethe B2', href: '/luyen-nghe/goethe#b2', description: 'Phân tích nâng cao' }] },
  { title: 'ÖSD', href: '/luyen-nghe/osd', links: [{ label: 'ÖSD B1', href: '/luyen-nghe/osd#b1', description: 'Luyện tập chuyên sâu' }, { label: 'ÖSD B2', href: '/luyen-nghe/osd#b2', description: 'Luyện tập nâng cao' }] },
];

const readingColumns: MenuColumn[] = [
  { title: 'GOETHE', href: '/luyen-doc/goethe', links: [{ label: 'Goethe B1', href: '/luyen-doc/goethe#b1', description: 'Đọc hiểu theo cấp độ' }, { label: 'Goethe B2', href: '/luyen-doc/goethe#b2', description: 'Phân tích nâng cao' }] },
  { title: 'ÖSD', href: '/luyen-doc/osd', links: [{ label: 'ÖSD B1', href: '/luyen-doc/osd#b1', description: 'Luyện tập chuyên sâu' }, { label: 'ÖSD B2', href: '/luyen-doc/osd#b2', description: 'Luyện tập nâng cao' }] },
];

const sampleColumns: MenuColumn[] = [
  { title: 'GOETHE', href: '/bai-mau/goethe', links: [{ label: 'Bài mẫu Schreiben Goethe B1', href: '/bai-mau/goethe#schreiben-b1' }, { label: 'Bài mẫu Schreiben Goethe B2', href: '/bai-mau/goethe#schreiben-b2' }, { label: 'Bài mẫu Sprechen Goethe B1', href: '/bai-mau/goethe#sprechen-b1' }, { label: 'Bài mẫu Sprechen Goethe B2', href: '/bai-mau/goethe#sprechen-b2' }] },
  { title: 'ÖSD', href: '/bai-mau/osd', links: [{ label: 'Bài mẫu Schreiben ÖSD B1', href: '/bai-mau/osd#schreiben-b1' }, { label: 'Bài mẫu Schreiben ÖSD B2', href: '/bai-mau/osd#schreiben-b2' }, { label: 'Bài mẫu Sprechen ÖSD B1', href: '/bai-mau/osd#sprechen-b1' }, { label: 'Bài mẫu Sprechen ÖSD B2', href: '/bai-mau/osd#sprechen-b2' }] },
];

function MenuLink({ item, active, onClick }: { item: LinkItem; active: boolean; onClick: () => void }) {
  return <Link className={`group block rounded-xl px-3 py-2.5 transition-all hover:bg-red-50/70 ${active ? 'bg-red-50' : ''}`} href={item.href} onClick={onClick}><span className="block text-sm font-semibold text-slate-700 transition-colors hover:text-[#da2527] group-hover:text-[#da2527]">{item.label}</span>{item.description && <span className="mt-0.5 block line-clamp-1 text-xs text-slate-500">{item.description}</span>}</Link>;
}

function MegaMenu({ kind, pathname, onNavigate }: { kind: 'exam' | 'sample' | 'listening' | 'reading'; pathname: string; onNavigate: () => void }) {
  const columns = kind === 'exam' ? examColumns : kind === 'listening' ? practiceColumns : kind === 'reading' ? readingColumns : sampleColumns;
  const width = kind === 'exam' ? 'w-[920px] grid-cols-4' : kind === 'sample' ? 'w-[760px] grid-cols-2' : 'w-[540px] grid-cols-2';
  const gap = kind === 'exam' ? 'gap-4' : 'gap-5';
  return <div className={`absolute left-1/2 top-full z-50 mt-2 grid -translate-x-1/2 animate-in fade-in slide-in-from-top-1 ${width} ${gap} rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl`} role="menu">
     {columns.map((column) => <div className="space-y-2" key={column.title}><Link className="group/header mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2.5 text-[15px] font-extrabold text-slate-900 transition-colors hover:text-[#da2527] lg:text-base" href={column.href ?? '#'} onClick={onNavigate}>{column.title}<span aria-hidden="true" className="text-lg font-semibold transition-transform group-hover/header:translate-x-1">→</span></Link>{column.links.map((item) => <MenuLink active={pathname.startsWith(item.href.split('#')[0])} item={item} key={item.href} onClick={onNavigate} />)}</div>)}
    {kind === 'exam' && <div className="space-y-3 border-l border-slate-100 pl-4"><a className="group block rounded-xl border border-red-200 bg-red-50/80 p-3 transition-all hover:bg-red-100" href="/de-thi/a1-a2" onClick={onNavigate}><div className="text-[11px] font-bold uppercase tracking-wider text-[#da2527]">Cấp độ A1 - A2</div><div className="mt-0.5 text-xs font-semibold text-slate-800 group-hover:text-[#da2527]">Kho đề thi nền tảng →</div><p className="mt-1 text-[10px] text-slate-500">Đầy đủ chuẩn Goethe, ÖSD, TELC</p></a><div className="space-y-1"><a className="block rounded-lg p-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-red-50/50 hover:text-[#da2527]" href="/de-thi/a1-a2#goethe" onClick={onNavigate}>Đề thi Goethe A1 - A2</a><a className="block rounded-lg p-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-red-50/50 hover:text-[#da2527]" href="/de-thi/a1-a2#osd" onClick={onNavigate}>Đề thi ÖSD A1 - A2</a><a className="block rounded-lg p-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-red-50/50 hover:text-[#da2527]" href="/de-thi/a1-a2#telc" onClick={onNavigate}>Đề thi TELC A1 - A2</a></div></div>}
  </div>;
}

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  tone: 'streak' | 'lesson' | 'promo' | 'plan';
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'noti-1',
    title: 'Duy trì chuỗi 7 ngày học liên tiếp',
    description: 'Hoàn thành 1 bài luyện hôm nay để giữ vững phong độ học tiếng Đức của bạn.',
    time: '15 phút trước',
    href: '/hoc-tap',
    unread: true,
    tone: 'streak',
  },
  {
    id: 'noti-2',
    title: 'Bài thi ÖSD B1 đang làm dở',
    description: 'ÖSD B1 · Modelltest 01 (Lesen Teil 1) đang ở 24%. Bấm để tiếp tục làm bài.',
    time: '2 giờ trước',
    href: '/lam-bai/local-osd-b1-mock-01-exam-lesen-1794838978263-eeef8e?auth=1',
    unread: true,
    tone: 'lesson',
  },
  {
    id: 'noti-3',
    title: 'Lịch khai giảng lớp A1 – B2 SHD Education',
    description: 'Tặng kèm buổi học giao tiếp với Giáo viên bản ngữ khi đăng ký trong tháng này.',
    time: 'Hôm qua',
    href: '/de-thi',
    unread: false,
    tone: 'promo',
  },
  {
    id: 'noti-4',
    title: 'Gói Free còn 23 ngày sử dụng',
    description: 'Nhập mã học viên SHD tại trang Tài khoản để gia hạn miễn phí không giới hạn.',
    time: '2 ngày trước',
    href: '/tai-khoan',
    unread: false,
    tone: 'plan',
  },
];

export function SiteHeader() {
  const { user, ready, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [authOpen, setAuthOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? '/';

  const unreadCount = notifications.filter((item) => item.unread).length;
  const markAllRead = () => setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  const markOneRead = (id: string) => setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        setActiveMenu(null);
        setAccountOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const navigate = () => { setOpen(false); setActiveMenu(null); setAccountOpen(false); setNotificationsOpen(false); };
  const menuItems: Array<{ label: string; href: string; kind?: 'exam' | 'sample' | 'listening' | 'reading' }> = [
    { label: 'ÖSD & Goethe Online-Test', href: '/de-thi', kind: 'exam' }, { label: 'Luyện Hören', href: '/luyen-nghe', kind: 'listening' }, { label: 'Luyện Lesen', href: '/luyen-doc', kind: 'reading' }, { label: 'Chép chính tả', href: '/chep-chinh-ta' }, { label: 'Bài mẫu', href: '/bai-mau', kind: 'sample' },
  ];

  return <>
    <header className="site-header relative z-50 bg-white"><div className="header-inner relative z-50 flex w-full items-center justify-between px-6 lg:px-12">
      <a href="/" className="brand" onClick={navigate}><img className="brand-logo" src="/logo-shd-tu-hoc-tieng-duc.png" alt={copy.brand} /></a>
      <nav className="nav text-[15px] font-semibold text-slate-700 lg:text-base" aria-label="Điều hướng chính"><a className={`nav-home ${pathname === '/' ? 'text-[#da2527]' : ''}`} href="/" onClick={navigate}>Trang chủ</a>{menuItems.map((item) => { const active = pathname.startsWith(item.href); return <div className="relative" key={item.label} onMouseEnter={() => item.kind && setActiveMenu(item.label)} onMouseLeave={() => item.kind && setActiveMenu(null)}><a className={`${active ? 'text-[#da2527]' : ''}`} href={item.href} onClick={navigate}>{item.label}{item.kind && <ChevronDown className="ml-1 inline" size={12} />}</a>{item.kind && activeMenu === item.label && <MegaMenu kind={item.kind} onNavigate={navigate} pathname={pathname} />}</div>; })}</nav>
      <label className="search"><Search size={15} aria-hidden="true" /><span className="sr-only">Tìm kiếm</span><input placeholder="Tìm kiếm bài học" aria-label="Tìm kiếm bài học" /></label>
      <div className="header-actions">{ready && user ? <>
        <div className="relative" ref={notificationsRef}>
          <button
            className={`header-icon-button ${notificationsOpen ? 'border-[#da2527]/40 bg-red-50/70 text-[#da2527]' : ''}`}
            type="button"
            aria-label="Thông báo"
            aria-expanded={notificationsOpen}
            data-testid="notifications-trigger"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setAccountOpen(false);
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>
          {notificationsOpen && (
            <div
              role="region"
              aria-label="Danh sách thông báo"
              data-testid="notifications-popover"
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] sm:w-[376px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-extrabold text-slate-900">Thông báo</strong>
                  {unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#da2527] px-1.5 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#da2527] transition-colors hover:bg-red-50"
                  >
                    <CheckCheck size={14} />
                    <span>Đánh dấu đã đọc</span>
                  </button>
                )}
              </div>
              <div className="max-h-[340px] divide-y divide-slate-100 overflow-y-auto">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markOneRead(item.id);
                      setNotificationsOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 ${
                      item.unread ? 'bg-red-50/35' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        item.tone === 'streak'
                          ? 'bg-red-50 text-[#da2527]'
                          : item.tone === 'lesson'
                            ? 'bg-blue-50 text-blue-600'
                            : item.tone === 'promo'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {item.tone === 'streak' ? (
                        <Flame size={15} />
                      ) : item.tone === 'lesson' ? (
                        <BookOpen size={15} />
                      ) : item.tone === 'promo' ? (
                        <Sparkles size={15} />
                      ) : (
                        <Clock size={15} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`m-0 text-xs leading-snug ${item.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {item.title}
                        </p>
                        {item.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#da2527]" />}
                      </div>
                      <p className="mt-1 mb-0 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                      <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
                        {item.time}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center">
                <Link
                  href="/hoc-tap"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-[#da2527] hover:underline"
                >
                  Xem tổng quan tiến độ học tập →
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="account-menu" ref={accountRef}>
          <button
            className="account-trigger"
            type="button"
            aria-expanded={accountOpen}
            onClick={() => {
              setAccountOpen((value) => !value);
              setNotificationsOpen(false);
            }}
          >
            <span className="avatar avatar-small">{user.initials}</span>
            <span className="account-trigger-copy"><strong>{user.name}</strong><small>{user.plan} plan</small></span>
            <ChevronDown size={14} />
          </button>
          {accountOpen && (
            <div className="account-dropdown">
              <div className="account-dropdown-head">
                <span className="avatar">{user.initials}</span>
                <span><strong>{user.name}</strong><small>{user.email}</small></span>
              </div>
              <a href="/hoc-tap" onClick={() => setAccountOpen(false)}>Trang học tập</a>
              <a href="/tai-khoan" onClick={() => setAccountOpen(false)}>Tài khoản &amp; Lịch sử</a>
              <a href="/tai-khoan-pro" onClick={() => setAccountOpen(false)}>Nâng cấp SHD Pro</a>
              <button type="button" onClick={() => { signOut(); setAccountOpen(false); }}>Đăng xuất</button>
            </div>
          )}
        </div>
      </> : ready ? <button className="button button-primary header-login" type="button" onClick={() => setAuthOpen(true)}><UserRound size={15} /> Đăng nhập</button> : <span className="header-placeholder" />}</div>
      <button className="menu-button" type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      {open && <div className="absolute right-4 left-4 top-[calc(100%-4px)] z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl lg:hidden"><MobileNavigation onNavigate={navigate} pathname={pathname} /></div>}
    </div></header>
    {shouldShowGlobalAnnouncementBar(pathname) && <TopAnnouncementBar />}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </>;
}
