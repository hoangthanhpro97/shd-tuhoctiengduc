'use client';

import { useEffect, useRef, useState } from 'react';
import type { EvidenceLocator } from '../../data/deep-learning-fixtures';

export function EvidenceReader({ content, evidence, paragraphs }: { content?: string; evidence?: EvidenceLocator; paragraphs?: Array<{ id: string; label: string; text: string }> }) {
  const targetRef = useRef<HTMLElement>(null);
  const [highlighted, setHighlighted] = useState(false);
  useEffect(() => { if (!highlighted) return; const timer = window.setTimeout(() => setHighlighted(false), 2200); return () => window.clearTimeout(timer); }, [highlighted]);
  function locate() { targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setHighlighted(true); }
  return <article className="evidence-reader"><div className="evidence-reader-heading"><span className="eyebrow">Ngữ liệu</span>{evidence && <button className="button button-quiet" type="button" onClick={locate}>Định vị đoạn này</button>}</div>{paragraphs?.length ? <div className="evidence-paragraphs">{paragraphs.map((paragraph) => <article id={paragraph.id} data-anchor-id={paragraph.id} ref={paragraph.id === evidence?.anchorId ? targetRef as React.RefObject<HTMLElement> : undefined} className={highlighted && paragraph.id === evidence?.anchorId ? 'evidence-highlight' : ''} key={paragraph.id}><span>{paragraph.label}</span><p>{paragraph.text}</p></article>)}</div> : <p ref={targetRef as React.RefObject<HTMLParagraphElement>} className={highlighted ? 'evidence-highlight' : ''}>{content}</p>}{evidence && <small className="evidence-excerpt">Bằng chứng: “{evidence.excerpt}”</small>}</article>;
}
