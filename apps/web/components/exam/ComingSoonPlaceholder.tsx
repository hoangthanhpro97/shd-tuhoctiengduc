import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Clock3 } from 'lucide-react';

export type ComingSoonExam = {
  slug: string;
  provider: 'Goethe' | 'ÖSD' | 'TELC' | 'SHD';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  description: string;
};

export const comingSoonExams: ComingSoonExam[] = [
  {
    slug: 'a1-a2',
    provider: 'SHD',
    level: 'A1',
    title: 'Kho đề A1 - A2',
    description: 'Các bộ đề Goethe, ÖSD và TELC trình độ A1 - A2 đang được biên tập và sẽ mở sau khi hoàn tất kiểm duyệt.',
  },
  {
    slug: 'goethe-b1',
    provider: 'Goethe',
    level: 'B1',
    title: 'Goethe-Zertifikat B1',
    description: 'Bộ đề mô phỏng Goethe B1 đang được biên tập theo đúng cấu trúc Lesen và Hören.',
  },
  {
    slug: 'goethe-b2',
    provider: 'Goethe',
    level: 'B2',
    title: 'Goethe-Zertifikat B2',
    description: 'Nội dung luyện thi Goethe B2 sẽ được cập nhật sau khi hoàn tất kiểm duyệt học thuật.',
  },
  {
    slug: 'osd-b1',
    provider: 'ÖSD',
    level: 'B1',
    title: 'ÖSD Zertifikat B1',
    description: 'Đề mô phỏng ÖSD B1 đang được hoàn thiện. Bạn có thể bắt đầu với bộ đề ÖSD B1 hiện có.',
  },
  {
    slug: 'osd-b2',
    provider: 'ÖSD',
    level: 'B2',
    title: 'ÖSD Zertifikat B2',
    description: 'Đề mô phỏng ÖSD B2 đang được hoàn thiện theo nội dung học thuật của SHD.',
  },
  {
    slug: 'telc-b1',
    provider: 'TELC',
    level: 'B1',
    title: 'telc Deutsch B1',
    description: 'Bộ đề telc B1 đang được xây dựng và sẽ mở ngay khi dữ liệu đạt chuẩn kiểm duyệt.',
  },
  {
    slug: 'telc-b2',
    provider: 'TELC',
    level: 'B2',
    title: 'telc Deutsch B2',
    description: 'Bộ đề telc B2 đang trong lộ trình phát triển nội dung.',
  },
];

export function getComingSoonExam(slug: string) {
  return comingSoonExams.find((exam) => exam.slug === slug) ?? null;
}

export function ComingSoonPlaceholder({ exam }: { exam: ComingSoonExam }) {
  return (
    <main className="coming-soon-page">
      <div className="container">
        <section className="coming-soon-card" aria-labelledby="coming-soon-title">
          <div className="coming-soon-art" aria-hidden="true">
            <BookOpenCheck size={42} strokeWidth={1.5} />
            <span>{exam.level}</span>
          </div>
          <p className="eyebrow">{exam.provider} · {exam.level} · Đang cập nhật</p>
          <h1 id="coming-soon-title">{exam.title} sắp ra mắt</h1>
          <p className="coming-soon-description">{exam.description}</p>
          <div className="coming-soon-status"><Clock3 size={15} /> Nội dung đang được biên tập và kiểm tra chất lượng</div>
          <div className="coming-soon-actions">
            <Link className="button button-primary" href="/de-thi">Xem kho đề hiện có <ArrowRight size={15} /></Link>
            <Link className="button button-quiet" href="/de-thi/a1-a2">Xem hub Goethe · ÖSD · TELC</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
