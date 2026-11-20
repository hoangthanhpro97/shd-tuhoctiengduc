'use client';

import { ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type MobileLink = { label: string; href: string; description?: string };
type MobileSection = { label: string; href?: string; links?: MobileLink[]; columns?: Array<{ label: string; href: string; links: MobileLink[] }> };

const sections: MobileSection[] = [
  { label: 'ÖSD & Goethe Online-Test', href: '/de-thi', links: [
    { label: 'Goethe B1', href: '/de-thi/goethe#b1' }, { label: 'Goethe B2', href: '/de-thi/goethe#b2' },
    { label: 'ÖSD B1', href: '/de-thi/osd#b1' }, { label: 'ÖSD B2', href: '/de-thi/osd#b2' },
    { label: 'TELC B1', href: '/de-thi/telc#b1' }, { label: 'TELC B2', href: '/de-thi/telc#b2' },
    { label: 'Kho đề A1 - A2', href: '/de-thi/a1-a2', description: 'Goethe · ÖSD · TELC' },
  ], columns: [
    { label: 'GOETHE', href: '/de-thi/goethe', links: [{ label: 'Goethe B1', href: '/de-thi/goethe#b1' }, { label: 'Goethe B2', href: '/de-thi/goethe#b2' }] },
    { label: 'ÖSD', href: '/de-thi/osd', links: [{ label: 'ÖSD B1', href: '/de-thi/osd#b1' }, { label: 'ÖSD B2', href: '/de-thi/osd#b2' }] },
    { label: 'TELC', href: '/de-thi/telc', links: [{ label: 'TELC B1', href: '/de-thi/telc#b1' }, { label: 'TELC B2', href: '/de-thi/telc#b2' }] },
  ] },
  { label: 'Bài mẫu', href: '/bai-mau', columns: [
    { label: 'GOETHE', href: '/bai-mau/goethe', links: [{ label: 'Bài mẫu Schreiben Goethe B1', href: '/bai-mau/goethe#schreiben-b1' }, { label: 'Bài mẫu Schreiben Goethe B2', href: '/bai-mau/goethe#schreiben-b2' }, { label: 'Bài mẫu Sprechen Goethe B1', href: '/bai-mau/goethe#sprechen-b1' }, { label: 'Bài mẫu Sprechen Goethe B2', href: '/bai-mau/goethe#sprechen-b2' }] },
    { label: 'ÖSD', href: '/bai-mau/osd', links: [{ label: 'Bài mẫu Schreiben ÖSD B1', href: '/bai-mau/osd#schreiben-b1' }, { label: 'Bài mẫu Schreiben ÖSD B2', href: '/bai-mau/osd#schreiben-b2' }, { label: 'Bài mẫu Sprechen ÖSD B1', href: '/bai-mau/osd#sprechen-b1' }, { label: 'Bài mẫu Sprechen ÖSD B2', href: '/bai-mau/osd#sprechen-b2' }] },
  ] },
  { label: 'Luyện Hören', href: '/luyen-nghe', columns: [
    { label: 'GOETHE', href: '/luyen-nghe/goethe', links: [{ label: 'Goethe B1', href: '/luyen-nghe/goethe#b1' }, { label: 'Goethe B2', href: '/luyen-nghe/goethe#b2' }] },
    { label: 'ÖSD', href: '/luyen-nghe/osd', links: [{ label: 'ÖSD B1', href: '/luyen-nghe/osd#b1' }, { label: 'ÖSD B2', href: '/luyen-nghe/osd#b2' }] },
  ] },
  { label: 'Luyện Lesen', href: '/luyen-doc', columns: [
    { label: 'GOETHE', href: '/luyen-doc/goethe', links: [{ label: 'Goethe B1', href: '/luyen-doc/goethe#b1' }, { label: 'Goethe B2', href: '/luyen-doc/goethe#b2' }] },
    { label: 'ÖSD', href: '/luyen-doc/osd', links: [{ label: 'ÖSD B1', href: '/luyen-doc/osd#b1' }, { label: 'ÖSD B2', href: '/luyen-doc/osd#b2' }] },
  ] },
  { label: 'Chép chính tả', href: '/chep-chinh-ta' },
];

export function MobileNavigation({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <nav className="mt-2 border-t border-slate-100 pt-2" aria-label="Điều hướng mobile">
      <a className={`block rounded-xl px-3 py-3 text-sm font-bold ${pathname === '/' ? 'bg-red-50 text-[#da2527]' : 'text-slate-700'}`} href="/" onClick={onNavigate}>Trang chủ</a>
      {sections.map((section) => {
        const active = Boolean(section.href && pathname.startsWith(section.href));
          const expandable = Boolean(section.links?.length || section.columns?.length);
        return <div className="border-b border-slate-100 last:border-0" key={section.label}>
          <div className="flex items-center gap-2">
            <a className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-sm font-bold ${active ? 'text-[#da2527]' : 'text-slate-700'}`} href={section.href} onClick={!expandable ? onNavigate : undefined}>{section.label}</a>
            {expandable && <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-expanded={open === section.label} aria-label={`Mở ${section.label}`} onClick={() => setOpen((value) => value === section.label ? null : section.label)} type="button"><ChevronDown className={`transition-transform ${open === section.label ? 'rotate-180 text-[#da2527]' : ''}`} size={17} /></button>}
          </div>
          {expandable && open === section.label && <div className="grid gap-3 px-3 pb-3"><a className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500" href={section.href} onClick={onNavigate}>Xem tổng quan <ExternalLink className="ml-1 inline" size={12} /></a>{section.columns ? section.columns.map((column) => <div key={column.href}><Link className="group/header mb-1.5 flex items-center justify-between border-b border-slate-200 pb-2 text-[15px] font-extrabold text-slate-900 transition-colors hover:text-[#da2527] lg:text-base" href={column.href} onClick={onNavigate}>{column.label}<span aria-hidden="true" className="text-lg font-semibold">→</span></Link><div className="grid gap-1">{column.links.map((link) => <Link className={`rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 ${pathname.startsWith(link.href.split('#')[0]) ? 'bg-red-50 text-[#da2527]' : 'hover:bg-slate-50 hover:text-[#da2527]'}`} href={link.href} onClick={onNavigate} key={link.href}>{link.label}</Link>)}</div></div>) : section.links?.map((link) => <a className={`rounded-lg px-3 py-2 text-xs font-semibold ${pathname.startsWith(link.href.split('#')[0]) ? 'bg-red-50 text-[#da2527]' : 'text-slate-600 hover:bg-slate-50'}`} href={link.href} onClick={onNavigate} key={link.href}>{link.label}{link.description && <small className="mt-0.5 block text-[10px] font-normal text-slate-400">{link.description}</small>}</a>)}</div>}
        </div>;
      })}
    </nav>
  );
}
