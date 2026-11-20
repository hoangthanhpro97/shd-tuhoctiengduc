'use client';

import { ChevronDown, Crosshair, Headphones } from 'lucide-react';
import { useState } from 'react';
import type { AudioLocator, EvidenceLocator, ExplanationStep, ParaphrasePair } from '../../data/deep-learning-fixtures';

export function ExplanationSteps({ steps, paraphrases, evidence, audio, onLocateEvidence, onSeekAudio }: { steps: ExplanationStep[]; paraphrases: ParaphrasePair[]; evidence?: EvidenceLocator; audio?: AudioLocator; onLocateEvidence?: (locator: EvidenceLocator) => void; onSeekAudio?: (locator: AudioLocator) => void }) {
  const [open, setOpen] = useState(0);
  return <div className="explanation-steps">{steps.map((step, index) => <article className={`explanation-step ${open === index ? 'is-open' : ''}`} key={step.title}>
    <button className="explanation-step-trigger" type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span className="explanation-step-number">{String(index + 1).padStart(2, '0')}</span><span>{step.title}</span><ChevronDown size={16} /></button>
    {open === index && <div className="explanation-step-content"><p>{step.content}</p>{index === 1 && <div className="locator-actions">{evidence && onLocateEvidence && <button className="button button-quiet" type="button" onClick={() => onLocateEvidence(evidence)}><Crosshair size={14} /> Định vị đáp án</button>}{audio && onSeekAudio && <button className="button button-quiet" type="button" onClick={() => onSeekAudio(audio)}><Headphones size={14} /> Nghe từ đây</button>}</div>}{index === 2 && paraphrases.length > 0 && <div className="paraphrase-table">{paraphrases.map((pair) => <div className="paraphrase-row" key={`${pair.questionPhrase}-${pair.sourcePhrase}`}><span>{pair.questionPhrase}</span><b>↔</b><span>{pair.sourcePhrase}</span><small>{pair.note}</small></div>)}</div>}</div>}
  </article>)}</div>;
}
