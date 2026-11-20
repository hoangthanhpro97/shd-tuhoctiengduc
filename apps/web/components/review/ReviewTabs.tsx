'use client';

import { useState } from 'react';
import type { AudioLocator, EvidenceLocator, ExplanationStep, ParaphrasePair, VocabularyEntry } from '../../data/deep-learning-fixtures';
import { ExplanationSteps } from './ExplanationSteps';
import { VocabularyPanel } from './VocabularyPanel';

export type ReviewLearningItem = {
  questionId: string;
  explanation?: string | null;
  learningMetadata?: { keywordAnalysis: string[]; evidenceAnchorId: string | null; audioStartMs: number | null; audioEndMs: number | null; transcriptId: string | null; paraphrases: ParaphrasePair[]; vocabulary: VocabularyEntry[]; steps: ExplanationStep[] } | null;
};

export function ReviewTabs({ item, evidence, audio, onLocateEvidence, onSeekAudio }: { item: ReviewLearningItem; evidence?: EvidenceLocator; audio?: AudioLocator; onLocateEvidence?: (locator: EvidenceLocator) => void; onSeekAudio?: (locator: AudioLocator) => void }) {
  const [tab, setTab] = useState<'explanation' | 'vocabulary'>('explanation');
  const metadata = item.learningMetadata;
  return <div className="review-tabs-shell"><div className="review-tabs" role="tablist" aria-label="Nội dung học sâu"><button className={tab === 'explanation' ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === 'explanation'} onClick={() => setTab('explanation')}>Giải thích</button><button className={tab === 'vocabulary' ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === 'vocabulary'} onClick={() => setTab('vocabulary')}>Từ vựng <span>{metadata?.vocabulary.length ?? 0}</span></button></div>{tab === 'explanation' ? <div className="review-explanation-tab">{metadata?.keywordAnalysis?.length ? <div className="keyword-row"><strong>Từ khóa:</strong>{metadata.keywordAnalysis.map((keyword) => <span key={keyword}>{keyword}</span>)}</div> : null}<ExplanationSteps steps={metadata?.steps ?? [{ title: 'Phân tích câu hỏi & từ khóa', content: item.explanation ?? 'Lời giải chi tiết sẽ được hiển thị tại đây.' }]} paraphrases={metadata?.paraphrases ?? []} evidence={evidence} audio={audio} onLocateEvidence={onLocateEvidence} onSeekAudio={onSeekAudio} /></div> : <VocabularyPanel vocabulary={metadata?.vocabulary ?? []} />}</div>;
}
