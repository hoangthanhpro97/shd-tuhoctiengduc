'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ExamHeader } from '../ExamHeader';
import { ExamBottomPagination } from '../ExamBottomPagination';
import { AuxiliaryDrawer, type TextHighlight, type StudentNote } from '../AuxiliaryDrawer';
import { analyzeReadingText, type AnalysisResult } from '../../../lib/reading-analyzer';
import { StimulusSlot } from './StimulusSlot';
import { QuestionRenderer } from './QuestionRenderer';
import type {
  Column3Mode,
  CursorMode,
  FontScope,
  HighlightColor,
  OverviewQuestionItem,
  WorkstationPayload,
  WorkstationPolicy,
  WorkstationSection,
} from './types';
import styles from '../ExamRoom.module.css';

export interface WorkstationShellProps {
  payload: WorkstationPayload;
  policy: WorkstationPolicy;
  activeSection: WorkstationSection;
  activeSectionIndex: number;
  activePart: number;
  currentQuestionId: string | null;
  answers: Record<string, string | null>;
  flaggedIds: Set<string>;
  highlights: TextHighlight[];
  studentNotes: StudentNote[];
  saveStatus: 'saving' | 'saved' | 'error';
  saveError: string | null;
  remainingSeconds: number | null;
  elapsedSeconds: number;
  answerCount: number;
  totalQuestions: number;
  answeredInActivePart: number;
  unansweredInActivePart: number;
  unansweredTotal: number;
  overviewQuestions: OverviewQuestionItem[];
  stimulusScrollRef: RefObject<HTMLDivElement | null>;
  questionsScrollRef: RefObject<HTMLElement | null>;
  onChangePart: (part: number) => void;
  onSelectQuestion: (questionId: string) => void;
  onToggleFlag: (questionId?: string) => void;
  onSaveAnswer: (questionId: string, value: string) => void;
  onSubmit: () => void;
  onAddHighlight: (text: string, color: HighlightColor) => void;
  onDeleteHighlight: (id: string) => void;
  onSaveNote: (note: { quote?: string; content: string }) => void;
  onDeleteNote: (id: string) => void;
}

export function WorkstationShell({
  payload,
  policy,
  activeSection,
  activeSectionIndex,
  activePart,
  currentQuestionId,
  answers,
  flaggedIds,
  highlights,
  studentNotes,
  saveStatus,
  saveError,
  remainingSeconds,
  elapsedSeconds,
  answerCount,
  totalQuestions,
  answeredInActivePart: _answeredInActivePart,
  unansweredInActivePart,
  unansweredTotal,
  overviewQuestions,
  stimulusScrollRef,
  questionsScrollRef,
  onChangePart,
  onSelectQuestion,
  onToggleFlag,
  onSaveAnswer,
  onSubmit,
  onAddHighlight,
  onDeleteHighlight,
  onSaveNote,
  onDeleteNote,
}: WorkstationShellProps) {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    if (authParam === '0' || authParam === 'false') {
      setIsLoggedIn(false);
    } else if (authParam === '1' || authParam === 'true') {
      setIsLoggedIn(true);
    } else {
      const stored = window.localStorage.getItem('shd-demo-user');
      setIsLoggedIn(Boolean(stored));
    }
  }, []);

  // UI state
  const [column3Mode, setColumn3Mode] = useState<Column3Mode>(null);
  const [cursorMode, setCursorMode] = useState<CursorMode>('pointer');
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow');

  // Font scale
  const [fontScale, setFontScale] = useState(1.0);
  const [fontScope, setFontScope] = useState<FontScope>({
    passage: true,
    questions: true,
    guide: true,
  });

  // Overview popover
  const [overviewOpen, setOverviewOpen] = useState(false);

  // Note and Lookup draft states
  const [newNoteDraft, setNewNoteDraft] = useState<{ quote: string; content: string } | null>(null);
  const [activeLookupText, setActiveLookupText] = useState<string | null>(null);
  const [lookupAnalysis, setLookupAnalysis] = useState<AnalysisResult | null>(null);
  const [activeHoverQuote, setActiveHoverQuote] = useState<string | null>(null);

  // Splitters
  const [splitterRatio, setSplitterRatio] = useState(0.5);
  const [isSplitterActive, setIsSplitterActive] = useState(false);
  const isSplitterDragging = useRef(false);

  const [column3Width, setColumn3Width] = useState(380);
  const [isSplitter2Active, setIsSplitter2Active] = useState(false);
  const isSplitter2Dragging = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Passage text for lookup analysis
  const fullPassageText = useMemo(() => {
    if (activeSection.stimulus?.type === 'text') {
      return activeSection.stimulus.content || '';
    }
    if (activeSection.stimulus?.type === 'audio' && activeSection.stimulus.transcriptTurns) {
      return activeSection.stimulus.transcriptTurns.map((t) => t.textDe).join('\n');
    }
    return '';
  }, [activeSection.stimulus]);

  // Note trigger
  const handleTriggerNote = useCallback((quote: string) => {
    setNewNoteDraft({ quote, content: '' });
    setColumn3Mode('notes');
  }, []);

  // Lookup trigger
  const handleTriggerLookup = useCallback(
    (text: string) => {
      setActiveLookupText(text);
      const analysis = analyzeReadingText(text, fullPassageText, activePart);
      setLookupAnalysis(analysis);
      setColumn3Mode('lookup');
    },
    [activePart, fullPassageText]
  );

  // Splitter 1 resize (between Stimulus and Questions)
  const startSplitterResize = (event: ReactMouseEvent) => {
    event.preventDefault();
    isSplitterDragging.current = true;
    setIsSplitterActive(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSplitterDragging.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const availableWidth = column3Mode ? rect.width - column3Width : rect.width;
      const x = moveEvent.clientX - rect.left;
      const ratio = Math.max(0.25, Math.min(0.75, x / availableWidth));
      setSplitterRatio(ratio);
    };

    const onMouseUp = () => {
      isSplitterDragging.current = false;
      setIsSplitterActive(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Splitter 2 resize (between Questions and Column 3)
  const startSplitter2Resize = (event: ReactMouseEvent) => {
    event.preventDefault();
    isSplitter2Dragging.current = true;
    setIsSplitter2Active(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSplitter2Dragging.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const newWidth = Math.max(280, Math.min(520, rect.right - moveEvent.clientX));
      setColumn3Width(newWidth);
    };

    const onMouseUp = () => {
      isSplitter2Dragging.current = false;
      setIsSplitter2Active(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const is3Col = isLoggedIn && column3Mode !== null;

  // Layout proportions
  const stimulusFlex = `${splitterRatio} ${splitterRatio} 0`;
  const questionsFlex = `${1 - splitterRatio} ${1 - splitterRatio} 0`;

  const stimulusScale = fontScope.passage ? fontScale : 1.0;
  const questionsScale = fontScope.questions ? fontScale : 1.0;

  const isLastPart = activeSectionIndex === payload.sections.length - 1;
  const nextSection = !isLastPart ? payload.sections[activeSectionIndex + 1] : undefined;
  const prevSection = activeSectionIndex > 0 ? payload.sections[activeSectionIndex - 1] : undefined;

  const exit = () => {
    if (window.confirm('Bạn có chắc muốn rời phòng thi?')) {
      window.location.href = payload.skill === 'hoeren' ? '/luyen-nghe' : '/de-thi';
    }
  };

  const timerSeconds = policy.timerBehavior === 'countdown' ? remainingSeconds : elapsedSeconds;

  return (
    <main className={`${styles.root} ${payload.skill === 'lesen' ? styles.compactReadingRoot : ''}`}>
      {/* ================= TOP BAR ================= */}
      <ExamHeader
        examTitle={payload.title}
        level={payload.level}
        mode={payload.mode}
        isLoggedIn={isLoggedIn}
        remainingSeconds={timerSeconds}
        fontScale={fontScale}
        fontScope={fontScope}
        answeredCount={answerCount}
        totalQuestions={totalQuestions}
        saveStatus={saveStatus}
        bookmarked={currentQuestionId ? flaggedIds.has(currentQuestionId) : false}
        readingPage={{
          current: activePart,
          total: payload.sections.length,
          label: `${payload.skill === 'hoeren' ? 'Hören' : 'Lesen'} · Teil ${activePart}`,
        }}
        column3Mode={column3Mode}
        onOpenColumn3Tab={(tab) => setColumn3Mode(tab)}
        onCloseColumn3={() => setColumn3Mode(null)}
        onToggleGuide={() => setColumn3Mode((prev) => (prev === 'guide' ? null : 'guide'))}
        onFontScaleChange={setFontScale}
        onFontScopeChange={setFontScope}
        onToggleBookmark={() => onToggleFlag()}
        cursorMode={cursorMode}
        highlightColor={highlightColor}
        onCursorModeChange={setCursorMode}
        onHighlightColorChange={setHighlightColor}
        onSubmit={onSubmit}
        onExit={exit}
      />

      {/* ================= BODY (VIEWPORT MAX 3 COLUMNS) ================= */}
      <div ref={bodyRef} className={`${styles.body} ${is3Col ? styles.bodyWithGuide : ''}`}>
        {/* ================= CỘT 1: STIMULUS SLOT (ĐA HÌNH THEO SKILL) ================= */}
        <StimulusSlot
          section={activeSection}
          examSlug={payload.id}
          level={payload.level}
          fontScale={stimulusScale}
          mode={payload.mode}
          policy={policy}
          isLoggedIn={isLoggedIn}
          cursorMode={cursorMode}
          highlightColor={highlightColor}
          highlights={highlights}
          activeHoverQuote={activeHoverQuote}
          activeLookupText={activeLookupText}
          scrollRef={stimulusScrollRef}
          flexProportion={stimulusFlex}
          onCursorModeChange={setCursorMode}
          onHighlightColorChange={setHighlightColor}
          onAddHighlight={onAddHighlight}
          onDeleteHighlight={onDeleteHighlight}
          onTriggerNote={handleTriggerNote}
          onTriggerLookup={handleTriggerLookup}
        />

        {/* Thanh kéo Splitter 1 giữa Cột 1 và Cột 2 */}
        <div
          className={`${styles.paneSplitter} ${isSplitterActive ? styles.paneSplitterActive : ''}`}
          onMouseDown={startSplitterResize}
          role="separator"
          aria-label="Kéo chỉnh kích thước 2 cột"
        >
          <div className={styles.paneSplitterLine} />
          <div className={styles.paneSplitterPill}>
            <ArrowLeftRight size={11} />
            <span>Kéo chỉnh</span>
          </div>
        </div>

        {/* ================= CỘT 2: QUESTION RENDERER ================= */}
        <QuestionRenderer
          section={activeSection}
          providerFormat={payload.provider}
          fontScale={questionsScale}
          answers={answers}
          saving={saveStatus === 'saving'}
          saveError={saveError}
          activePart={activePart}
          isLastPart={isLastPart}
          nextPart={nextSection?.part}
          unansweredInActivePart={unansweredInActivePart}
          unansweredTotal={unansweredTotal}
          scrollRef={questionsScrollRef}
          onAnswer={onSaveAnswer}
          onNextPart={() => nextSection && onChangePart(nextSection.part)}
          flexProportion={questionsFlex}
        />

        {/* Thanh kéo Splitter 2 giữa Cột 2 và Cột 3 */}
        {is3Col && (
          <div
            className={`${styles.paneSplitter} ${isSplitter2Active ? styles.paneSplitterActive : ''}`}
            onMouseDown={startSplitter2Resize}
            role="separator"
            aria-label="Kéo chỉnh kích thước cột 3"
          >
            <div className={styles.paneSplitterLine} />
            <div className={styles.paneSplitterPill}>
              <ArrowLeftRight size={11} />
              <span>Kéo chỉnh</span>
            </div>
          </div>
        )}

        {/* ================= CỘT 3: AUXILIARY DRAWER (MUTUAL EXCLUSION) ================= */}
        {is3Col && (
          <AuxiliaryDrawer
            width={column3Width}
            activeTab={column3Mode}
            mode={payload.mode}
            skill={payload.skill}
            highlights={highlights}
            notes={studentNotes}
            newNoteDraft={newNoteDraft}
            lookupAnalysis={lookupAnalysis}
            fullPassage={fullPassageText}
            part={activePart}
            guideQuestions={activeSection.questions}
            currentQuestionId={currentQuestionId ?? undefined}
            onSelectQuestion={onSelectQuestion}
            onTabChange={(tab) => setColumn3Mode(tab)}
            onClose={() => setColumn3Mode(null)}
            onSaveNote={onSaveNote}
            onCancelNoteDraft={() => setNewNoteDraft(null)}
            onDeleteNote={onDeleteNote}
            onDeleteHighlight={onDeleteHighlight}
            onHoverQuote={setActiveHoverQuote}
          />
        )}
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <ExamBottomPagination
        questions={overviewQuestions}
        activePart={activePart}
        currentId={currentQuestionId ?? activeSection.questions[0]?.id ?? ''}
        isLoggedIn={isLoggedIn}
        overviewOpen={overviewOpen}
        onOverview={() => setOverviewOpen((v) => !v)}
        onSelectPart={onChangePart}
        onSelectQuestion={(q) => onSelectQuestion(q.id)}
        onPreviousPart={() => prevSection && onChangePart(prevSection.part)}
        onNextPart={() => nextSection && onChangePart(nextSection.part)}
        onSubmit={onSubmit}
      />
    </main>
  );
}
