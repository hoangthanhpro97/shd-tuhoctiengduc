import type { CSSProperties } from 'react';
import type { ExamPublicPayload } from '@shd/contracts';
import styles from './ExamRoom.module.css';
import { getReadingStimulus } from '../../data/reading-stimuli';

export type ExamStimulusPaneProps = { section: ExamPublicPayload['sections'][number]; examSlug: string; fontScale: number; mobileVisible?: boolean; highlightMode?: boolean; onTextSelection?: () => void };

export function ExamStimulusPane({ section, examSlug, fontScale, mobileVisible = false, highlightMode = false, onTextSelection }: ExamStimulusPaneProps) {
  const part = Math.min(5, Math.max(1, section.questions[0]?.part ?? 1));
  const generatedReading = /osd-(?:b1|b2)-test-0[234]/.test(examSlug) || (!section.stimulus && section.skill === 'Lesen');
  const readingStimulus = section.skill === 'Lesen' && generatedReading ? getReadingStimulus(examSlug, part, examSlug.includes('b2') ? 'B2' : 'B1') : null;
  return <section className={`${styles.pane} ${styles.stimulusPane} ${mobileVisible ? styles.mobileVisible : ''} ${highlightMode ? styles.highlightMode : ''}`} aria-label="Ngữ liệu"><div className={styles.paneHeading}><span>{section.skill === 'Lesen' ? `Teil ${part}` : section.skill}</span><h2>{readingStimulus?.title ?? section.stimulus?.title ?? section.title}</h2><small className={styles.stimulusHint}>{highlightMode ? 'Chế độ highlight đang bật · chọn văn bản để đánh dấu' : 'Đọc kỹ ngữ liệu trước khi chọn đáp án'}</small></div>{section.skill === 'Lesen' && readingStimulus ? <div className={styles.stimulusContent} style={{ '--stimulus-scale': fontScale } as CSSProperties} onMouseUp={onTextSelection}><p className="whitespace-pre-line">{readingStimulus.content}</p></div> : section.stimulus?.type === 'audio' ? <AudioStimulus section={section} /> : <div className={styles.stimulusContent} style={{ '--stimulus-scale': fontScale } as CSSProperties} onMouseUp={onTextSelection}><p className="whitespace-pre-line">{section.stimulus?.content ?? 'Ngữ liệu đang được bổ sung.'}</p></div>}</section>;
}

function AudioStimulus({ section }: { section: ExamPublicPayload['sections'][number] }) { return <div className={styles.stimulusContent}><h3>{section.stimulus?.title ?? 'Nghe hiểu'}</h3>{section.stimulus?.audioUrl ? <audio className={styles.audio} controls preload="metadata" src={section.stimulus.audioUrl}><track kind="captions" /></audio> : <p className={styles.audioFallback}>Audio mẫu chưa có file local. Bạn có thể đọc transcript.</p>}{section.stimulus?.dialogueTranscript && <div className={styles.transcript}>{section.stimulus.dialogueTranscript.map((turn) => <p className={`${styles.dialogue} ${turn.roleSide.toLowerCase() === 'right' ? styles.dialogueRight : ''}`} key={`${turn.speakerId}-${turn.timestampStart}`}><strong>{turn.speakerName}</strong><small>{Math.round(turn.timestampStart)}s</small><span>{turn.textDe}</span><small>{turn.textVi}</small></p>)}</div>}</div>; }
