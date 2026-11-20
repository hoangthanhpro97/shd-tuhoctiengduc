'use client';

import { Volume2 } from 'lucide-react';
import type { VocabularyEntry } from '../../data/deep-learning-fixtures';

function speak(term: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(term);
  utterance.lang = 'de-DE';
  window.speechSynthesis.speak(utterance);
}

export function VocabularyPanel({ vocabulary }: { vocabulary: VocabularyEntry[] }) {
  if (!vocabulary.length) return <div className="learning-empty-panel">Chưa có từ vựng trọng tâm cho bài này.</div>;
  return <div className="vocabulary-list">{vocabulary.map((entry) => <article className="vocabulary-card" key={entry.id}>
    <div className="vocabulary-card-top"><div><span className="vocabulary-term">{entry.article ? `${entry.article} ` : ''}{entry.term}</span>{entry.plural && <small>{entry.plural}</small>}</div><button className="icon-action" type="button" onClick={() => speak(entry.term)} aria-label={`Nghe phát âm ${entry.term}`}><Volume2 size={16} /></button></div>
    <div className="vocabulary-meta"><span>{entry.partOfSpeech}</span><code>{entry.ipa}</code></div>
    <p><strong>Nghĩa:</strong> {entry.definitionVi}</p>
    <p><strong>Ngữ cảnh:</strong> {entry.contextVi}</p>
    <div className="vocabulary-example"><p>{entry.exampleDe}</p><small>{entry.exampleVi}</small></div>
  </article>)}</div>;
}
