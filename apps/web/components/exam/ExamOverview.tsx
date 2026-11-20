'use client';

import type { AttemptMode, ExamPublicPayload } from '@shd/contracts';
import { useState } from 'react';
import { StartExamButton } from './StartExamButton';

export function ExamOverview({ exam }: { exam: ExamPublicPayload }) {
  const questionCount = exam.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const [mode, setMode] = useState<AttemptMode>('exam');
  return (
    <main className="exam-overview-page">
      <div className="container exam-overview">
        <p className="eyebrow">ÖSD &amp; Goethe Online-Test · {exam.examMetadata.cefrLevel} · {exam.examMetadata.providerFormat}</p>
        <div className="detail-hero">
          <div className="detail-thumbnail"><span className="badge">{exam.examMetadata.cefrLevel}</span><strong>{exam.examMetadata.title.split('·')[0]}</strong></div>
          <div className="detail-content"><h1>{exam.examMetadata.title}</h1><p className="exam-disclaimer">{exam.examMetadata.disclaimer}</p><div className="academic-card-meta"><span className="badge">{exam.examMetadata.cefrLevel}</span><span className="badge badge-neutral">{exam.examMetadata.providerFormat}</span><span>{questionCount} câu</span><span>{exam.examMetadata.totalDurationMinutes} phút</span></div></div>
        </div>
        <div className="exam-overview-grid">
          <section className="exam-overview-card">
            <h2>Chỉ số đề thi</h2>
            <dl className="exam-facts">
              <div><dt>Trình độ</dt><dd>{exam.examMetadata.cefrLevel}</dd></div>
              <div><dt>Thời lượng</dt><dd>{exam.examMetadata.totalDurationMinutes} phút</dd></div>
              <div><dt>Số câu</dt><dd>{questionCount} câu</dd></div>
              <div><dt>Ngưỡng tham khảo</dt><dd>{exam.examMetadata.passPercentage}%</dd></div>
              <div><dt>Số phần thi</dt><dd>{exam.sections.length} phần</dd></div>
            </dl>
            <div className="exam-mode-selector"><p className="eyebrow">Chọn cách luyện</p><div className="exam-mode-options"><button className={mode === 'exam' ? 'is-active' : ''} type="button" onClick={() => setMode('exam')}><strong>Thi thử</strong><small>Exam Mode · có đồng hồ</small></button><button className={mode === 'practice' ? 'is-active' : ''} type="button" onClick={() => setMode('practice')}><strong>Luyện tập</strong><small>Practice Mode · tự học linh hoạt</small></button></div><StartExamButton slug={exam.examMetadata.slug} mode={mode} /></div>
          </section>
          <section className="exam-overview-card">
            <h2>Cấu trúc bài thi</h2>
            <div className="section-summary-list">
              {exam.sections.map((section) => (
                <article key={section.sectionId} className="section-summary">
                  <div><strong>{section.skill}</strong><span>{section.title}</span></div>
                  <div><span>{section.questions.length} câu</span><span>{section.durationMinutes} phút</span></div>
                </article>
              ))}
            </div>
            <p className="exam-note">Lời giải mẫu của câu 1 và 2 mỗi phần được mở sẵn cho SEO và trải nghiệm thử. Lời giải chi tiết từ câu 3 cần hoàn thành bước mở khóa.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
