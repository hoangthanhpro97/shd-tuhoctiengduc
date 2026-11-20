import Link from 'next/link';
import { ArrowRight, Clock3, ListChecks } from 'lucide-react';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { ExamBookCover } from './ExamBookCover';

type ProviderKey = 'goethe' | 'osd' | 'telc';

const providerNames: Record<ProviderKey, string> = {
  goethe: 'Goethe',
  osd: 'ÖSD',
  telc: 'TELC',
};

function providerForCover(provider: ProviderKey) {
  return provider;
}

function SummaryExamCard({ exam, provider }: { exam: PublicExamSummary; provider: ProviderKey }) {
  const simulationNumber = exam.slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01';
  return (
    <article className="provider-exam-card">
      <Link className="block" href={`/de-thi/${exam.slug}`}>
        <ExamBookCover
          level={exam.cefrLevel === 'C1' ? 'B2' : exam.cefrLevel}
          provider={providerForCover(provider)}
          simulationNumber={simulationNumber}
          title={exam.title}
        />
      </Link>
      <div className="provider-exam-card-body">
        <div className="provider-exam-card-kicker">{providerNames[provider]} Zertifikat {exam.cefrLevel}</div>
        <h3>{exam.title}</h3>
        <div className="provider-exam-card-meta"><span><ListChecks size={14} /> {exam.questionCount} câu</span><span><Clock3 size={14} /> {exam.durationMinutes} phút</span></div>
        <Link className="provider-exam-card-link" href={`/de-thi/${exam.slug}`}>Xem cấu trúc đề <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

function ComingSoonLevel({ provider, level }: { provider: Exclude<ProviderKey, 'osd'>; level: 'B1' | 'B2' }) {
  return (
    <div className="provider-coming-soon">
      <div>
        <span className="provider-coming-soon-label">Đang cập nhật</span>
        <h3>{providerNames[provider]} {level} sắp ra mắt</h3>
        <p>Bộ đề theo chuẩn {providerNames[provider]} {level} đang được biên tập. Trong lúc chờ, bạn có thể luyện ngay với đề ÖSD tương đương.</p>
      </div>
      <Link className="button button-quiet" href={`/de-thi/osd#${level.toLowerCase()}`}>Luyện đề ÖSD {level} <ArrowRight size={15} /></Link>
    </div>
  );
}

export function ExamProviderSummary({ provider, exams }: { provider: ProviderKey; exams: PublicExamSummary[] }) {
  const levels: Array<'B1' | 'B2'> = ['B1', 'B2'];
  return (
    <main className="provider-summary-page">
      <div className="container">
        <header className="provider-summary-hero">
          <p className="eyebrow">Chuẩn khảo thí · {providerNames[provider]}</p>
          <h1>{providerNames[provider]} Online-Test</h1>
          <p>Chọn cấp độ để xem cấu trúc bài thi, thời lượng và các bộ đề luyện tập được tổ chức theo chuẩn khảo thí.</p>
          <nav className="provider-summary-nav" aria-label={`Cấp độ ${providerNames[provider]}`}>
            {levels.map((level) => <a href={`#${level.toLowerCase()}`} key={level}>{providerNames[provider]} {level} <ArrowRight size={14} /></a>)}
          </nav>
        </header>
        <div className="provider-summary-sections">
          {levels.map((level) => {
            const levelExams = exams.filter((exam) => exam.cefrLevel === level);
            return (
              <section className="provider-summary-section scroll-mt-24" id={level.toLowerCase()} key={level}>
                <div className="provider-summary-section-heading"><div><p className="eyebrow">{providerNames[provider]} · {level}</p><h2>{providerNames[provider]} Zertifikat {level}</h2></div><span>{levelExams.length ? `${levelExams.length} bộ đề` : 'Đang cập nhật'}</span></div>
                {levelExams.length ? <div className="provider-exam-grid">{levelExams.map((exam) => <SummaryExamCard exam={exam} provider={provider} key={exam.slug} />)}</div> : provider === 'osd' ? <div className="provider-empty-state">Chưa có bộ đề ÖSD {level} khả dụng.</div> : <ComingSoonLevel provider={provider} level={level} />}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
