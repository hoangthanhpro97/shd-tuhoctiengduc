'use client';

import { useEffect, useState } from 'react';
import type { AttemptResultPublicPayload } from '@shd/contracts';
import { LeadGateModal } from '../lead-gate/LeadGateModal';
import { ReviewTabs } from '../review/ReviewTabs';

export function ResultClient({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<AttemptResultPublicPayload | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  useEffect(() => { void fetch(`/api/v1/attempts/${attemptId}/result`, { cache: 'no-store' }).then((response) => response.ok ? response.json() : null).then(setResult); }, [attemptId]);
  if (!result) return <main className="result-page"><div className="container"><div className="skeleton">Đang tải kết quả...</div></div></main>;
  const review = result.review?.items ?? [];
  return <main className="result-page"><div className="container result-shell"><p className="eyebrow">Kết quả bài thi</p><h1>{result.isPassed ? 'Bạn đã đạt mốc tham khảo' : 'Bài thi đã hoàn thành'}</h1><section className="result-score-card"><div><span>Điểm tổng</span><strong>{result.totalScore}<small>/{result.maxPossibleScore}</small></strong><p>{result.percentage}% · {result.cefrEstimateCode}</p></div><div className={`result-status ${result.isPassed ? 'is-pass' : ''}`}>{result.isPassed ? 'Bestanden' : 'Cần luyện thêm'}</div></section><div className="result-sections">{result.sectionScores.map((section) => <div className="result-section" key={section.sectionId}><span>{section.sectionId}</span><strong>{section.score}/{section.maxScore}</strong><small>{section.percentage}%</small></div>)}</div><section className="review-card"><div className="review-heading"><div><p className="eyebrow">Review</p><h2>Nhìn lại câu trả lời</h2></div>{!result.review?.unlocked && <button className="button button-primary" type="button" onClick={() => setGateOpen(true)}>Mở toàn bộ lời giải</button>}</div><div className="review-list">{review.map((item) => <article className="review-item" key={item.questionId}><div><strong>{item.questionId}</strong><span>{item.access === 'locked' ? 'Lời giải đang khóa' : item.isCorrect ? 'Đúng' : 'Chưa đúng'}</span></div>{item.access === 'locked' ? <p>Hoàn thành form xác thực để xem bẫy tư duy và trích dẫn.</p> : <ReviewTabs item={item} />}</article>)}</div></section></div>{gateOpen && <LeadGateModal attemptId={attemptId} onClose={() => setGateOpen(false)} onUnlocked={(next) => { setResult((current) => current ? { ...current, review: next.review } : current); setGateOpen(false); }} />}</main>;
}
