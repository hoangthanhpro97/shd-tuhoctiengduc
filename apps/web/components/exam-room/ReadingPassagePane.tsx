'use client';

import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import type { ExamPublicPayload } from '@shd/contracts';
import type { TextHighlight } from './AuxiliaryDrawer';
import { getReadingStimulus } from '../../data/reading-stimuli';
import styles from './ExamRoom.module.css';

export type CursorMode = 'pointer' | 'highlight' | 'note' | 'erase' | 'lookup';

export type ReadingPassagePaneProps = {
  section: ExamPublicPayload['sections'][number];
  examSlug: string;
  fontScale: number;
  mode: 'exam' | 'practice';
  cursorMode: CursorMode;
  highlightColor: 'yellow' | 'green' | 'pink';
  highlights: TextHighlight[];
  activeHoverQuote: string | null;
  activeLookupText: string | null;
  mobileVisible?: boolean;
  isLoggedIn?: boolean;
  onCursorModeChange: (mode: CursorMode) => void;
  onHighlightColorChange: (color: 'yellow' | 'green' | 'pink') => void;
  onAddHighlight: (text: string, color: 'yellow' | 'green' | 'pink') => void;
  onDeleteHighlight: (id: string) => void;
  onTriggerNote: (quote: string) => void;
  onTriggerLookup: (text: string) => void;
};

export function ReadingPassagePane({
  section,
  examSlug,
  fontScale,
  mode,
  cursorMode,
  highlightColor,
  highlights,
  activeHoverQuote,
  activeLookupText,
  mobileVisible = true,
  isLoggedIn = true,
  onCursorModeChange: _onCursorModeChange,
  onHighlightColorChange: _onHighlightColorChange,
  onAddHighlight,
  onDeleteHighlight,
  onTriggerNote,
  onTriggerLookup,
}: ReadingPassagePaneProps) {
  const passageRef = useRef<HTMLDivElement>(null);
  const part = Math.min(5, Math.max(1, section.questions[0]?.part ?? 1));

  const generatedReading =
    /osd-(?:b1|b2)-test-0[234]/.test(examSlug) || (!section.stimulus && section.skill === 'Lesen');
  const readingStimulus =
    section.skill === 'Lesen' && generatedReading
      ? getReadingStimulus(examSlug, part, examSlug.includes('b2') ? 'B2' : 'B1')
      : null;

  const rawTitle = readingStimulus?.title ?? section.stimulus?.title ?? section.title;
  const rawContent = readingStimulus?.content ?? section.stimulus?.content ?? 'Ngữ liệu đang được cập nhật.';

  // Handle MouseUp text selection
  const handleMouseUp = () => {
    // Ẩn/khóa toàn bộ tương tác highlight/note/lookup khi chưa đăng nhập
    if (!isLoggedIn) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1) return;

    // Check if selection happened within our passage
    if (passageRef.current && !passageRef.current.contains(selection.anchorNode)) {
      return;
    }

    if (cursorMode === 'highlight') {
      onAddHighlight(selectedText, highlightColor);
      selection.removeAllRanges();
    } else if (cursorMode === 'note') {
      onTriggerNote(selectedText);
    } else if (cursorMode === 'lookup' && mode === 'practice') {
      onTriggerLookup(selectedText);
    }
  };

  // Render passage with highlights, bi-directional hover quote, and active lookup
  const renderedContent = useMemo(() => {
    if (!isLoggedIn) {
      // Khi chưa đăng nhập: Hiển thị văn bản đọc hiểu thuần túy, không có lớp highlight/chú thích
      return <div className={styles.annotatedPassageText}>{rawContent}</div>;
    }
    return renderAnnotatedPassage(
      rawContent,
      highlights.filter((h) => h.part === part),
      activeHoverQuote,
      activeLookupText,
      cursorMode,
      onDeleteHighlight
    );
  }, [isLoggedIn, rawContent, highlights, part, activeHoverQuote, activeLookupText, cursorMode, onDeleteHighlight]);

  return (
    <section
      className={`${styles.pane} ${styles.stimulusPane} ${mobileVisible ? styles.mobileVisible : ''}`}
      aria-label="Ngữ liệu bài đọc"
      style={{ '--stimulus-scale': fontScale } as CSSProperties}
    >
      {/* Pane Heading */}
      <div className={styles.paneHeading}>
        <span>Teil {part}</span>
        <h2>{rawTitle}</h2>
      </div>

      {/* Main Passage Content */}
      <div
        ref={passageRef}
        className={`${styles.stimulusContent} ${cursorMode === 'erase' ? styles.eraserActive : ''}`}
        onMouseUp={handleMouseUp}
      >
        <div className={styles.annotatedPassageText}>{renderedContent}</div>
      </div>
    </section>
  );
}

/**
 * Intelligent helper to split text and insert marks for active quotes & highlights
 */
function renderAnnotatedPassage(
  text: string,
  highlights: TextHighlight[],
  activeHoverQuote: string | null,
  activeLookupText: string | null,
  cursorMode: CursorMode,
  onDeleteHighlight: (id: string) => void
) {
  if (!text) return null;

  type AnnotationSpan = {
    start: number;
    end: number;
    type: 'hover' | 'lookup' | 'highlight';
    highlight?: TextHighlight;
  };

  const spans: AnnotationSpan[] = [];

  // 1. Bi-directional Hover Quote Match
  if (activeHoverQuote && activeHoverQuote.trim().length > 3) {
    const quote = activeHoverQuote.trim();
    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf(quote, pos);
      if (idx === -1) break;
      spans.push({ start: idx, end: idx + quote.length, type: 'hover' });
      pos = idx + quote.length;
    }
  }

  // 2. Active Lookup Text Match
  if (activeLookupText && activeLookupText.trim().length > 1) {
    const lookup = activeLookupText.trim();
    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf(lookup, pos);
      if (idx === -1) break;
      spans.push({ start: idx, end: idx + lookup.length, type: 'lookup' });
      pos = idx + lookup.length;
    }
  }

  // 3. User Saved Highlights Match
  for (const hl of highlights) {
    if (!hl.text) continue;
    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf(hl.text, pos);
      if (idx === -1) break;
      spans.push({ start: idx, end: idx + hl.text.length, type: 'highlight', highlight: hl });
      pos = idx + hl.text.length;
    }
  }

  if (spans.length === 0) {
    return <p className="whitespace-pre-line">{text}</p>;
  }

  // Sort spans by priority: hover (highest) > lookup > highlight
  const priorityOrder = { hover: 3, lookup: 2, highlight: 1 };
  spans.sort((a, b) => a.start - b.start || priorityOrder[b.type] - priorityOrder[a.type]);

  // Non-overlapping flattening
  const flatSpans: AnnotationSpan[] = [];
  let currentEnd = 0;
  for (const span of spans) {
    if (span.start >= currentEnd) {
      flatSpans.push(span);
      currentEnd = span.end;
    }
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  flatSpans.forEach((span, i) => {
    if (span.start > lastIndex) {
      nodes.push(text.slice(lastIndex, span.start));
    }

    const matchedSegment = text.slice(span.start, span.end);

    if (span.type === 'hover') {
      // Amber Bi-Directional Highlight
      nodes.push(
        <mark
          key={`hover-${i}`}
          className={styles.biDirectionalHoverMark}
          title="Dẫn chứng khớp từ Cột 3"
        >
          {matchedSegment}
        </mark>
      );
    } else if (span.type === 'lookup') {
      // Sky blue temporary selection highlight
      nodes.push(
        <mark key={`lookup-${i}`} className={styles.lookupSelectionMark}>
          {matchedSegment}
        </mark>
      );
    } else if (span.highlight) {
      // Saved persistent highlight
      const hl = span.highlight;
      nodes.push(
        <mark
          key={`hl-${hl.id}-${i}`}
          className={`${styles.userHighlightMark} ${styles[`hlBg_${hl.color}`]}`}
          onClick={(e) => {
            if (cursorMode === 'erase') {
              e.stopPropagation();
              onDeleteHighlight(hl.id);
            }
          }}
          title={cursorMode === 'erase' ? 'Nhấp để xóa highlight' : undefined}
        >
          {matchedSegment}
        </mark>
      );
    }

    lastIndex = span.end;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <p className="whitespace-pre-line">{nodes}</p>;
}
