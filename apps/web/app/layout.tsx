import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { FloatingSupportBar } from '../components/layout/FloatingSupportBar';

const montserrat = localFont({
  src: [
    { path: './fonts/montserrat/montserrat-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/montserrat/montserrat-500.ttf', weight: '500', style: 'normal' },
    { path: './fonts/montserrat/montserrat-600.ttf', weight: '600', style: 'normal' },
    { path: './fonts/montserrat/montserrat-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SHD Tự học tiếng Đức',
  description: 'Luyện tiếng Đức miễn phí với đề thi mô phỏng Lesen và Hören.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">{children}<FloatingSupportBar /></body>
    </html>
  );
}
