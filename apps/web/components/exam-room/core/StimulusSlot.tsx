'use client';

import { type RefObject } from 'react';
import type { TextHighlight } from '../AuxiliaryDrawer';
import { ReadingPassagePane, type CursorMode } from '../ReadingPassagePane';
import { ListeningAudioPane } from './ListeningAudioPane';
import type { WorkstationPolicy, WorkstationSection } from './types';
import styles from '../ExamRoom.module.css';

export interface StimulusSlotProps {
  section: WorkstationSection;
  examSlug: string;
  level?: string;
  fontScale: number;
  mode: 'exam' | 'practice';
  policy: WorkstationPolicy;
  isLoggedIn?: boolean;
  cursorMode: CursorMode;
  highlightColor: 'yellow' | 'green' | 'pink';
  highlights: TextHighlight[];
  activeHoverQuote: string | null;
  activeLookupText: string | null;
  scrollRef?: RefObject<HTMLDivElement | null>;
  flexProportion?: string;
  onCursorModeChange: (mode: CursorMode) => void;
  onHighlightColorChange: (color: 'yellow' | 'green' | 'pink') => void;
  onAddHighlight: (text: string, color: 'yellow' | 'green' | 'pink') => void;
  onDeleteHighlight: (id: string) => void;
  onTriggerNote: (quote: string) => void;
  onTriggerLookup: (text: string) => void;
}

export function StimulusSlot({
  section,
  examSlug,
  level = 'B1',
  fontScale,
  mode,
  policy,
  isLoggedIn = true,
  cursorMode,
  highlightColor,
  highlights,
  activeHoverQuote,
  activeLookupText,
  scrollRef,
  flexProportion = '1 1 0',
  onCursorModeChange,
  onHighlightColorChange,
  onAddHighlight,
  onDeleteHighlight,
  onTriggerNote,
  onTriggerLookup,
}: StimulusSlotProps) {
  const isListening = section.skill === 'hoeren';

  // Construct standard section object compatible with ReadingPassagePane
  const readingSectionCompatible = {
    sectionId: `sec-${section.skill}-${section.part}`,
    skill: (section.skill === 'hoeren' ? 'Hoeren' : 'Lesen') as 'Hoeren' | 'Lesen',
    title: section.title,
    durationMinutes: 15,
    totalQuestions: section.questions.length,
    stimulus: section.stimulus
      ? {
          type: section.stimulus.type,
          title: section.stimulus.title,
          content: section.stimulus.type === 'text' ? section.stimulus.content : undefined,
          audioUrl: section.stimulus.type === 'audio' ? section.stimulus.audioUrl : undefined,
          annotations:
            'annotations' in section.stimulus
              ? (section.stimulus as { annotations?: Record<string, unknown> }).annotations
              : undefined,
        }
      : undefined,
    questions: section.questions,
  };

  return (
    <div
      ref={scrollRef}
      className={styles.paneWrapper}
      style={{ flex: flexProportion, width: 'auto' }}
    >
      {isListening ? (
        <ListeningAudioPane
          section={section}
          examSlug={examSlug}
          level={level}
          fontScale={fontScale}
          policy={policy}
          isLoggedIn={isLoggedIn}
          onTriggerNote={onTriggerNote}
          onTriggerLookup={onTriggerLookup}
          onAddHighlight={onAddHighlight}
        />
      ) : (
        <ReadingPassagePane
          section={readingSectionCompatible}
          examSlug={examSlug}
          fontScale={fontScale}
          mode={mode}
          isLoggedIn={isLoggedIn}
          cursorMode={cursorMode}
          highlightColor={highlightColor}
          highlights={highlights}
          activeHoverQuote={activeHoverQuote}
          activeLookupText={activeLookupText}
          mobileVisible
          onCursorModeChange={onCursorModeChange}
          onHighlightColorChange={onHighlightColorChange}
          onAddHighlight={onAddHighlight}
          onDeleteHighlight={onDeleteHighlight}
          onTriggerNote={onTriggerNote}
          onTriggerLookup={onTriggerLookup}
        />
      )}
    </div>
  );
}
