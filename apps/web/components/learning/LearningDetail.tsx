'use client';

import type { DeepLearningExercise } from '../../data/deep-learning-fixtures';
import { AudioTranscript } from '../review/AudioTranscript';
import { EvidenceReader } from '../review/EvidenceReader';
import { ReviewTabs } from '../review/ReviewTabs';
import { useState } from 'react';

export function LearningDetail({ exercise }: { exercise: DeepLearningExercise }) {
  const firstQuestion = exercise.reviewQuestions[0];
  const evidence = firstQuestion?.evidence;
  const audio = firstQuestion?.audio;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  return <main className="catalog-page"><div className="container learning-detail-page">
    <div className="detail-hero"><div className="detail-thumbnail"><span className="badge">{exercise.level}</span><strong>{exercise.skill === 'Hoeren' ? 'Hören' : 'Lesen'}</strong></div><div className="detail-content"><p className="eyebrow">{exercise.skill === 'Hoeren' ? 'Luyện nghe Hören' : 'Luyện đọc Lesen'} · {exercise.teil}</p><h1>{exercise.title}</h1><p>{exercise.description}</p><div className="academic-card-meta"><span className="badge">{exercise.level}</span><span className="badge badge-neutral">{exercise.provider}</span><span>{exercise.questions} câu · {exercise.attempts.toLocaleString('vi-VN')} lượt làm</span></div><div className="mt-3"><a href={`/${exercise.skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc'}/${exercise.slug}/lam-bai`} className="inline-flex items-center gap-2 rounded-lg bg-[#da2527] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#b91c1f]"><span>Vào luyện bài này ngay</span><span aria-hidden="true">→</span></a></div></div></div>
     <div className={`deep-learning-layout ${exercise.skill === 'Hoeren' ? 'is-listening' : 'is-reading'}`}>
      <section className="deep-learning-source">
        {!exercise.content && !exercise.audioUrl && !exercise.transcript?.length && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Ngữ liệu {exercise.skill === 'Hoeren' ? 'nghe và audio' : 'đọc'} chưa có trong tệp nguồn. Các câu hỏi đã được đồng bộ; nội dung ngữ liệu đang được bổ sung.</p>}
        {exercise.skill === 'Lesen' && exercise.content && <EvidenceReader content={exercise.content} paragraphs={exercise.content.split(/\n\n+/u).map((paragraph, index) => ({ id: index === 1 ? evidence?.anchorId ?? 'lesen-paragraph-b' : `lesen-paragraph-${String.fromCharCode(97 + index)}`, label: `Abschnitt ${String.fromCharCode(65 + index)}`, text: paragraph }))} evidence={evidence} />}
        {exercise.skill === 'Hoeren' && <AudioTranscript audioUrl={exercise.audioUrl} transcript={exercise.transcript ?? []} activeLocator={audio} />}
        {exercise.skill === 'Hoeren' && <div className="bilingual-panel transcript-note"><p className="eyebrow">Mẹo nghe</p><p>Đọc câu hỏi trước, sau đó dùng nút “Nghe từ đây” để luyện lại đúng mốc thông tin.</p></div>}
      </section>
       <section className="deep-learning-review"><div className="review-card"><div className="review-heading"><div><p className="eyebrow">Review từng câu</p><h2>Hiểu cách tìm đáp án</h2></div><span className="badge badge-neutral">{exercise.reviewQuestions.length} câu mẫu</span></div><nav className="learning-question-palette" aria-label="Câu hỏi review">{exercise.reviewQuestions.map((question, index) => <button type="button" className={index === currentQuestion ? 'is-active' : ''} onClick={() => setCurrentQuestion(index)} key={question.id}>{index + 1}</button>)}</nav>{(() => { const question = exercise.reviewQuestions[currentQuestion] ?? firstQuestion; if (!question) return null; return <article className="deep-question" key={question.id}><div className="deep-question-heading"><span>Câu hỏi {currentQuestion + 1}</span><strong>{question.prompt}</strong></div>{question.options?.length ? <div className="mt-4 space-y-2" aria-label="Các phương án trả lời">{question.options.map((option) => <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" key={option.id}><span className="font-bold text-[#da2527]">{option.id}</span><span>{option.text}</span></div>)}</div> : null}<ReviewTabs item={{ questionId: question.id, explanation: question.explanation, learningMetadata: { keywordAnalysis: question.keywords, evidenceAnchorId: question.evidence?.anchorId ?? null, audioStartMs: question.audio?.startMs ?? null, audioEndMs: question.audio?.endMs ?? null, transcriptId: question.audio?.transcriptId ?? null, paraphrases: question.paraphrases, vocabulary: exercise.vocabulary, steps: question.steps } }} evidence={question.evidence} audio={question.audio} /></article>; })()}</div></section>
    </div>
    <section className="vocabulary-summary"><div className="section-heading"><div><p className="eyebrow">Từ vựng trọng tâm</p><h2>Nhớ từ trong đúng ngữ cảnh</h2></div><span className="badge badge-neutral">{exercise.vocabulary.length} từ</span></div><div className="vocabulary-summary-grid">{exercise.vocabulary.slice(0, 3).map((word) => <div className="vocabulary-mini-card" key={word.id}><strong>{word.article ? `${word.article} ` : ''}{word.term}</strong><code>{word.ipa}</code><p>{word.definitionVi}</p></div>)}</div></section>
  </div></main>;
}
