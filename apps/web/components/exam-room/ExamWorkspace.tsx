'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { AttemptStatePayload, ExamPublicPayload, PublicQuestion, SaveAnswerPayload } from '@shd/contracts';
import { ExamHeader, type Column3Mode } from './ExamHeader';
import type { FontScope } from './FontSizePopover';
import { ReadingPassagePane, type CursorMode } from './ReadingPassagePane';
import { ExamBottomPagination } from './ExamBottomPagination';
import type { OverviewQuestion } from './QuestionOverviewPopover';
import { ReadingMatchingMatrix, ReadingQuestionRenderer } from './questions/ReadingQuestionRenderer';
import { AuxiliaryDrawer, type TextHighlight, type StudentNote } from './AuxiliaryDrawer';
import { analyzeReadingText, type AnalysisResult } from '../../lib/reading-analyzer';
import { getReadingStimulus } from '../../data/reading-stimuli';
import styles from './ExamRoom.module.css';
import { useExamSessionStore } from './examSessionStore';

type ReadingSection = ExamPublicPayload['sections'][number];
type ReadingQuestion = PublicQuestion & { section: ReadingSection };

const B1_READING_PART_SUBTITLES: Record<number, string> = {
  1: 'Blogbeitrag / E-Mail (Richtig/Falsch)',
  2: 'Zwei Pressetexte (Multiple Choice A/B/C)',
  3: 'Anzeigen & Situationen (Zuordnung a–j)',
  4: 'Leserbriefe / Meinungen (Ja/Nein)',
  5: 'Hinweise / Regeln (Multiple Choice A/B/C)',
};

const B2_READING_PART_SUBTITLES: Record<number, string> = {
  1: 'Sachtext / Artikel (Leseverstehen B2)',
  2: 'Meinungstext / Kommentar (Leseverstehen B2)',
  3: 'Zuordnung / Überschriften (Leseverstehen B2)',
  4: 'Sprachbausteine / Lückentext (Leseverstehen B2)',
};

function formatReadingExamTitle(slug: string, level: string, fallback: string) {
  const lower = slug.toLowerCase();
  const numMatch = lower.match(/(?:mock|test)-0?(\d+)$/i);
  if (lower.includes('osd') && numMatch) {
    const normalizedLevel = level === 'C1' ? 'B2' : level;
    return `ÖSD Zertifikat ${normalizedLevel} – Modelltest ${parseInt(numMatch[1], 10)}`;
  }
  return fallback;
}

function formatReadingPartSubtitle(sectionTitle: string, part: number, level: string) {
  const afterColon = sectionTitle.split(':').slice(1).join(':').trim();
  if (afterColon) return afterColon;
  const map = level === 'B2' ? B2_READING_PART_SUBTITLES : B1_READING_PART_SUBTITLES;
  return map[part] ?? 'Lesen';
}

function makeSections(exam: ExamPublicPayload) {
  const source = exam.sections
    .filter((section) => section.skill === 'Lesen')
    .flatMap((section) => section.questions.map((question) => ({ ...question, section })));
  return [1, 2, 3, 4, 5]
    .map((part) => ({
      part,
      questions: source.filter((question) => question.part === part),
      section:
        source.find((question) => question.part === part)?.section ??
        exam.sections.find((section) => section.skill === 'Lesen'),
    }))
    .filter((group): group is { part: number; questions: ReadingQuestion[]; section: ReadingSection } =>
      Boolean(group.section && group.questions.length)
    );
}

function findQuestionElement(id: string) {
  return document.querySelector<HTMLElement>(`[data-reading-question-id="${CSS.escape(id)}"]`);
}

export function ExamWorkspace({ attemptId }: { attemptId: string }) {
  const [state, setState] = useState<AttemptStatePayload | null>(null);
  const [exam, setExam] = useState<ExamPublicPayload | null>(null);
  const [roomMode, setRoomMode] = useState<'exam' | 'practice'>('practice');
  const [activePart, setActivePart] = useState(1);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // Column 3 state (Mutual Exclusion): 'guide' | 'highlights' | 'notes' | 'lookup' | null
  const [column3Mode, setColumn3Mode] = useState<Column3Mode>(null);

  // Active cursor tool mode on passage
  const [cursorMode, setCursorMode] = useState<CursorMode>('pointer');
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'pink'>('yellow');

  // Interactive annotation collections
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [newNoteDraft, setNewNoteDraft] = useState<{ quote: string; content: string } | null>(null);
  const [activeLookupText, setActiveLookupText] = useState<string | null>(null);
  const [lookupAnalysis, setLookupAnalysis] = useState<AnalysisResult | null>(null);
  const [activeHoverQuote, setActiveHoverQuote] = useState<string | null>(null);

  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState(1.0);
  const [fontScope, setFontScope] = useState<FontScope>({ passage: true, questions: true, guide: true });
  const [serverOffset, setServerOffset] = useState(0);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  // User Authentication State: Đã đăng nhập/đăng ký vs. Chưa đăng nhập/đăng ký
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

  // Splitter ratio between passage and questions
  const [splitterRatio, setSplitterRatio] = useState(0.5);
  const [isSplitterActive, setIsSplitterActive] = useState(false);
  const isSplitterDragging = useRef(false);

  // Splitter 2 between questions and column 3
  const [column3Width, setColumn3Width] = useState(380);
  const [isSplitter2Active, setIsSplitter2Active] = useState(false);
  const isSplitter2Dragging = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const revisions = useRef(new Map<string, number>());
  const failedSaves = useRef(new Set<string>());
  const submitting = useRef(false);
  const partScrollRef = useRef<HTMLDivElement>(null);

  // Load attempt and exam data
  useEffect(() => {
    let cancelled = false;
    useExamSessionStore.getState().reset();
    async function load() {
      const response = await fetch(`/api/v1/attempts/${attemptId}`, { cache: 'no-store' });
      if (!response.ok) return;
      const nextState = (await response.json()) as AttemptStatePayload;
      const examResponse = await fetch(`/api/v1/exams/${nextState.slug}`, { cache: 'no-store' });
      const nextExam = examResponse.ok ? ((await examResponse.json()) as ExamPublicPayload) : null;
      if (cancelled) return;
      setState(nextState);
      setRoomMode(nextState.mode === 'exam' ? 'exam' : 'practice');
      setExam(nextExam);
      setServerOffset(new Date(nextState.serverNow).getTime() - Date.now());
      revisions.current = new Map(nextState.answers.map((answer) => [answer.questionId, answer.revision]));
      if (nextExam) {
        const groups = makeSections(nextExam);
        setActivePart(groups[0]?.part ?? 1);
        setCurrentId(groups[0]?.questions[0]?.id ?? null);
      }

      // Restore highlights and notes from localStorage
      try {
        const savedHls = window.localStorage.getItem(`shd-highlights-${attemptId}`);
        if (savedHls) setHighlights(JSON.parse(savedHls));
        const savedNotes = window.localStorage.getItem(`shd-student-notes-${attemptId}`);
        if (savedNotes) setStudentNotes(JSON.parse(savedNotes));
      } catch {
        // Ignore localStorage parse errors
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  // Persist highlights and notes
  useEffect(() => {
    try {
      window.localStorage.setItem(`shd-highlights-${attemptId}`, JSON.stringify(highlights));
    } catch {
      // Ignore localStorage quota/privacy errors
    }
  }, [attemptId, highlights]);

  useEffect(() => {
    try {
      window.localStorage.setItem(`shd-student-notes-${attemptId}`, JSON.stringify(studentNotes));
    } catch {
      // Ignore localStorage quota/privacy errors
    }
  }, [attemptId, studentNotes]);

  // Resizing between passage column and question column
  const startSplitterResize = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      isSplitterDragging.current = true;
      setIsSplitterActive(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isSplitterDragging.current || !bodyRef.current) return;
        const rect = bodyRef.current.getBoundingClientRect();
        const availableWidth = column3Mode !== null ? rect.width - column3Width - 28 : rect.width - 14;
        const mouseX = moveEvent.clientX - rect.left;
        const ratio = mouseX / Math.max(availableWidth, 1);
        const clampedRatio = Math.max(0.25, Math.min(0.75, ratio));
        setSplitterRatio(clampedRatio);
      };

      const onMouseUp = () => {
        isSplitterDragging.current = false;
        setIsSplitterActive(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [column3Mode, column3Width]
  );

  // Resizing between question column and column 3
  const startSplitter2Resize = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    isSplitter2Dragging.current = true;
    setIsSplitter2Active(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSplitter2Dragging.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const nextWidth = rect.right - moveEvent.clientX;
      const clampedWidth = Math.max(300, Math.min(560, nextWidth));
      setColumn3Width(clampedWidth);
    };

    const onMouseUp = () => {
      isSplitter2Dragging.current = false;
      setIsSplitter2Active(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const groups = useMemo(() => (exam ? makeSections(exam) : []), [exam]);
  const activeGroup = groups.find((group) => group.part === activePart) ?? groups[0];
  const activeGroupIndex = activeGroup ? groups.findIndex((group) => group.part === activeGroup.part) : -1;
  const previousGroup = activeGroupIndex > 0 ? groups[activeGroupIndex - 1] : undefined;
  const nextGroup = activeGroupIndex >= 0 ? groups[activeGroupIndex + 1] : undefined;
  const activeSection = activeGroup
    ? { ...activeGroup.section, questions: activeGroup.questions, totalQuestions: activeGroup.questions.length }
    : null;
  const answerMap = useMemo(() => new Map(state?.answers.map((answer) => [answer.questionId, answer]) ?? []), [state]);
  const current = activeGroup?.questions.find((question) => question.id === currentId) ?? activeGroup?.questions[0];
  // Đồng bộ 100% giao diện chuẩn vàng (đã duyệt ở Modelltest 01) cho toàn bộ các đề Lesen (Modelltest 01–04 B1 & B2)
  const compactReadingHeader = true;
  const answerCount = groups.reduce(
    (sum, group) =>
      sum +
      group.questions.filter(
        (question) => answerMap.get(question.id)?.selectedOption !== null && answerMap.has(question.id)
      ).length,
    0
  );
  const allQuestions = groups.flatMap((group) => group.questions);
  const overviewQuestions: OverviewQuestion[] = allQuestions.map((question) => ({
    id: question.id,
    order: question.order,
    part: question.part,
    answered: answerMap.has(question.id) && answerMap.get(question.id)?.selectedOption !== null,
    flagged: flaggedIds.has(question.id),
  }));

  const remainingSeconds = useCountdown(state?.expiresAt, serverOffset, state?.mode === 'practice');

  // Count unanswered questions
  const answeredInActivePart =
    activeGroup?.questions.filter((q) => answerMap.has(q.id) && answerMap.get(q.id)?.selectedOption !== null).length ??
    0;
  const unansweredInActivePart = (activeGroup?.questions.length ?? 0) - answeredInActivePart;
  const unansweredTotal = allQuestions.length - answerCount;

  // Font scales
  const passageScale = fontScope.passage ? fontScale : 1.0;
  const questionsScale = fontScope.questions ? fontScale : 1.0;

  // Current passage text
  const fullPassageText = useMemo(() => {
    if (!state || !activeSection) return '';
    const part = Math.min(5, Math.max(1, activeSection.questions[0]?.part ?? 1));
    const generatedReading =
      /osd-(?:b1|b2)-test-0[234]/.test(state.slug) || (!activeSection.stimulus && activeSection.skill === 'Lesen');
    const stimulus =
      activeSection.skill === 'Lesen' && generatedReading
        ? getReadingStimulus(state.slug, part, state.slug.includes('b2') ? 'B2' : 'B1')
        : null;
    return stimulus?.content ?? activeSection.stimulus?.content ?? '';
  }, [state, activeSection]);

  const selectQuestion = useCallback((question: OverviewQuestion | ReadingQuestion) => {
    const targetPart = question.part;
    setActivePart(targetPart);
    setCurrentId(question.id);
    setOverviewOpen(false);
    window.setTimeout(() => {
      const node = findQuestionElement(question.id);
      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node?.classList.add(styles.questionFlash);
      window.setTimeout(() => node?.classList.remove(styles.questionFlash), 900);
    }, 80);
  }, []);

  const changePart = (part: number) => {
    const group = groups.find((item) => item.part === part);
    if (!group) return;
    setActivePart(part);
    setCurrentId(group.questions[0]?.id ?? null);
    partScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAnswer = (questionId: string, selectedOption: string) => {
    saveQueue.current = saveQueue.current
      .then(async () => {
        setSaving(questionId);
        const payload: SaveAnswerPayload = {
          questionId,
          selectedOption: selectedOption || null,
          revision: revisions.current.get(questionId) ?? 0,
          timeSpentSeconds: 0,
        };
        const response = await fetch(`/api/v1/attempts/${attemptId}/answers`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Chưa lưu được câu trả lời.');
        const result = (await response.json()) as { revision: number };
        revisions.current.set(questionId, result.revision);
        failedSaves.current.delete(questionId);
        setState((currentState) =>
          currentState
            ? {
                ...currentState,
                answers: [
                  ...currentState.answers.filter((answer) => answer.questionId !== questionId),
                  { questionId, selectedOption: selectedOption || null, revision: result.revision, answeredAt: new Date().toISOString() },
                ],
              }
            : currentState
        );
        setSaveError(null);
        setSaving(null);
      })
      .catch((error: unknown) => {
        failedSaves.current.add(questionId);
        setSaving(null);
        setSaveError(error instanceof Error ? error.message : 'Chưa lưu được câu trả lời.');
      });
  };

  const submit = async () => {
    if (!state || submitting.current) return;
    submitting.current = true;
    await saveQueue.current;
    if (!failedSaves.current.size) {
      const response = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId, userAnswers: [], timeSpentPerItem: {} }),
      });
      if (response.ok) window.location.href = `/ket-qua/${attemptId}`;
    }
    submitting.current = false;
  };

  useEffect(() => {
    if (remainingSeconds === 0 && state?.mode === 'exam' && !submitting.current) void submit();
  }, [remainingSeconds, state?.mode]);

  const toggleFlag = () => {
    if (!current) return;
    setFlaggedIds((previous) => {
      const next = new Set(previous);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const exit = () => {
    if (window.confirm('Bạn có chắc muốn rời phòng thi?')) window.location.href = '/de-thi';
  };

  // Trigger Note drafting when user selects text in passage
  const handleTriggerNote = (quote: string) => {
    setNewNoteDraft({ quote, content: '' });
    setColumn3Mode('notes');
  };

  // Trigger Lookup when user selects text in passage
  const handleTriggerLookup = (text: string) => {
    setActiveLookupText(text);
    const analysis = analyzeReadingText(text, fullPassageText, activePart);
    setLookupAnalysis(analysis);
    setColumn3Mode('lookup');
  };

  // Add new persistent highlight
  const handleAddHighlight = (text: string, color: 'yellow' | 'green' | 'pink') => {
    const newHl: TextHighlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      color,
      part: activePart,
    };
    setHighlights((prev) => [...prev, newHl]);
  };

  // Delete persistent highlight
  const handleDeleteHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // Save student note
  const handleSaveNote = ({ quote, content }: { quote?: string; content: string }) => {
    const newNote: StudentNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      quote,
      content,
      part: activePart,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setStudentNotes((prev) => [newNote, ...prev]);
    setNewNoteDraft(null);
  };

  // Delete student note
  const handleDeleteNote = (id: string) => {
    setStudentNotes((prev) => prev.filter((n) => n.id !== id));
  };

  if (!state || !exam || !activeGroup || !activeSection || !current) {
    return <main className={styles.loading}>Đang mở phòng thi...</main>;
  }

  const is3Col = isLoggedIn && column3Mode !== null;

  // Splitter proportions: Cột 1 và Cột 2 luôn chiếm 100% diện tích còn lại ngoài Cột 3 (tránh khoảng trắng ngoài cùng bên phải)
  const passageFlex = `${splitterRatio} ${splitterRatio} 0`;
  const questionsFlex = `${1 - splitterRatio} ${1 - splitterRatio} 0`;

  return (
    <main className={`${styles.root} ${compactReadingHeader ? styles.compactReadingRoot : ''}`}>
      <ExamHeader
        examTitle={formatReadingExamTitle(exam.examMetadata.slug, exam.examMetadata.cefrLevel, exam.examMetadata.title)}
        level={exam.examMetadata.cefrLevel}
        mode={roomMode}
        isLoggedIn={isLoggedIn}
        remainingSeconds={remainingSeconds}
        fontScale={fontScale}
        fontScope={fontScope}
        answeredCount={answerCount}
        totalQuestions={allQuestions.length}
        saveStatus={saving ? 'saving' : saveError ? 'error' : 'saved'}
        bookmarked={flaggedIds.has(current.id)}
        readingPage={{ current: activePart, total: groups.length, label: `Lesen · Teil ${activePart}` }}
        column3Mode={column3Mode}
        onOpenColumn3Tab={(tab) => setColumn3Mode(tab)}
        onCloseColumn3={() => setColumn3Mode(null)}
        onToggleGuide={() => setColumn3Mode((prev) => (prev === 'guide' ? null : 'guide'))}
        onModeChange={(m) => setRoomMode(m)}
        onFontScaleChange={setFontScale}
        onFontScopeChange={setFontScope}
        onToggleBookmark={toggleFlag}
        cursorMode={cursorMode}
        highlightColor={highlightColor}
        onCursorModeChange={setCursorMode}
        onHighlightColorChange={setHighlightColor}
        onSubmit={() => void submit()}
        onExit={exit}
      />

      <div ref={bodyRef} className={`${styles.body} ${is3Col ? styles.bodyWithGuide : ''}`}>
        {/* ================= CỘT 1: BÀI ĐỌC (PASSAGE) ================= */}
        <div className={styles.paneWrapper} style={{ flex: passageFlex, width: 'auto' }}>
          <ReadingPassagePane
            section={activeSection}
            examSlug={state.slug}
            fontScale={passageScale}
            mode={roomMode}
            isLoggedIn={isLoggedIn}
            cursorMode={cursorMode}
            highlightColor={highlightColor}
            highlights={highlights}
            activeHoverQuote={activeHoverQuote}
            activeLookupText={activeLookupText}
            mobileVisible
            onCursorModeChange={setCursorMode}
            onHighlightColorChange={setHighlightColor}
            onAddHighlight={handleAddHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            onTriggerNote={handleTriggerNote}
            onTriggerLookup={handleTriggerLookup}
          />
        </div>

        {/* Thanh kéo chia đôi 2 cột [Bài đọc] và [Câu hỏi] */}
        <div
          className={`${styles.paneSplitter} ${isSplitterActive ? styles.paneSplitterActive : ''}`}
          onMouseDown={startSplitterResize}
          role="separator"
          aria-label="Kéo chỉnh kích thước cột"
        >
          <div className={styles.paneSplitterLine} />
          <div className={styles.paneSplitterPill}>
            <ArrowLeftRight size={11} />
            <span>Kéo chỉnh</span>
          </div>
        </div>

        {/* ================= CỘT 2: CÂU HỎI (AUFGABEN) ================= */}
        <section
          className={`${styles.pane} ${styles.questionPane} ${styles.mobileVisible}`}
          style={
            {
              flex: questionsFlex,
              width: 'auto',
              '--font-scale': questionsScale,
            } as CSSProperties
          }
          aria-label={`Câu hỏi Teil ${activePart}`}
          ref={partScrollRef}
        >
          <div className={styles.questionTop}>
            <div>
              <div className={styles.questionBadgeRow}>
                <span className={styles.teilBadge}>
                  Aufgaben {activeGroup.questions[0].order}–{activeGroup.questions.at(-1)?.order}
                </span>
              </div>
              <h2 className={styles.questionPrompt}>
                Teil {activePart} · {formatReadingPartSubtitle(activeGroup.section.title, activePart, exam.examMetadata.cefrLevel)}
              </h2>
              {!compactReadingHeader && (
                <p className={styles.instructionText}>
                  {activePart === 3
                    ? 'Đọc các tình huống và chọn Anzeige phù hợp từ bảng a–j.'
                    : activePart === 1
                    ? 'Đọc bài Blogbeitrag và chọn Richtig hoặc Falsch.'
                    : activePart === 4
                    ? 'Đọc các Leserbriefe và chọn Ja hoặc Nein.'
                    : 'Đọc ngữ liệu và chọn phương án phù hợp.'}
                </p>
              )}
            </div>
            <div className={styles.questionSaveState}>{saving ? 'Đang lưu...' : saveError ?? 'Đã đồng bộ an toàn'}</div>
          </div>

          {activePart === 3 && activeGroup.questions.some((q) => q.options.some((o) => o.id === 'a')) ? (
            <div className={styles.readingQuestionCard}>
              <ReadingMatchingMatrix
                questions={activeGroup.questions}
                selectedOptions={
                  new Map(
                    activeGroup.questions.map((question) => [
                      question.id,
                      answerMap.get(question.id)?.selectedOption ?? null,
                    ])
                  )
                }
                onAnswer={saveAnswer}
                compact={compactReadingHeader}
              />
            </div>
          ) : (
            activeGroup.questions.map((question) => (
              <div key={question.id} data-reading-question-id={question.id} className={styles.readingQuestionCard}>
                <ReadingQuestionRenderer
                  question={question}
                  displayNumber={question.order}
                  providerFormat={exam.examMetadata.providerFormat}
                  selectedOption={answerMap.get(question.id)?.selectedOption}
                  compact={compactReadingHeader}
                  onAnswer={(optionId) => saveAnswer(question.id, optionId)}
                />
              </div>
            ))
          )}

          {/* Khối kết thúc Teil đã duyệt theo ảnh số 6 */}
          <div className={styles.partEnd}>
            <div className={styles.partEndDots}>···</div>
            <h3 className={styles.partEndTitle}>
              {!nextGroup ? 'Hết câu hỏi của bài test' : `Hết câu hỏi của Teil ${activePart}`}
            </h3>
            {!nextGroup
              ? unansweredTotal > 0 && (
                  <p className={styles.partEndSubtitle}>
                    Bạn còn <strong>{unansweredTotal} câu</strong> chưa trả lời. Hãy hoàn thành bài của mình nhé!
                  </p>
                )
              : unansweredInActivePart > 0 && (
                  <p className={styles.partEndSubtitle}>
                    Bạn còn <strong>{unansweredInActivePart} câu</strong> chưa trả lời ở phần này. Hãy hoàn thành bài của mình nhé!
                  </p>
                )}
            {nextGroup && (
              <button type="button" className={styles.partEndNextBtn} onClick={() => changePart(nextGroup.part)}>
                Tiếp tục sang Teil {nextGroup.part} →
              </button>
            )}
          </div>
        </section>

        {/* Thanh kéo chia 2 cột [Câu hỏi] và [Tiện ích Cột 3] (đồng bộ chuẩn hộp chữ kéo chỉnh như giữa cột 1 và 2) */}
        {is3Col && (
          <div
            className={`${styles.paneSplitter} ${isSplitter2Active ? styles.paneSplitterActive : ''}`}
            onMouseDown={startSplitter2Resize}
            role="separator"
            aria-label="Kéo chỉnh kích thước cột hướng dẫn"
          >
            <div className={styles.paneSplitterLine} />
            <div className={styles.paneSplitterPill}>
              <ArrowLeftRight size={11} />
              <span>Kéo chỉnh</span>
            </div>
          </div>
        )}

        {/* ================= CỘT 3: TIỆN ÍCH HỌC TẬP (LOẠI TRỪ LẪN NHAU: HƯỚNG DẪN / HIGHLIGHT / GHI CHÚ / TRA NGHĨA) ================= */}
        {is3Col && (
          <AuxiliaryDrawer
            width={column3Width}
            activeTab={column3Mode}
            mode={roomMode}
            highlights={highlights}
            notes={studentNotes}
            newNoteDraft={newNoteDraft}
            lookupAnalysis={lookupAnalysis}
            fullPassage={fullPassageText}
            part={activePart}
            guideQuestions={activeGroup.questions}
            currentQuestionId={current.id}
            onSelectQuestion={(id) => {
              const targetQuestion = activeGroup.questions.find((q) => q.id === id);
              if (targetQuestion) selectQuestion(targetQuestion);
            }}
            onTabChange={(tab) => setColumn3Mode(tab)}
            onClose={() => setColumn3Mode(null)}
            onSaveNote={handleSaveNote}
            onCancelNoteDraft={() => setNewNoteDraft(null)}
            onDeleteNote={handleDeleteNote}
            onDeleteHighlight={handleDeleteHighlight}
            onHoverQuote={setActiveHoverQuote}
          />
        )}
      </div>

      <ExamBottomPagination
        questions={overviewQuestions}
        activePart={activePart}
        currentId={current.id}
        isLoggedIn={isLoggedIn}
        overviewOpen={overviewOpen}
        onOverview={() => setOverviewOpen((value) => !value)}
        onSelectPart={changePart}
        onSelectQuestion={selectQuestion}
        onPreviousPart={() => previousGroup && changePart(previousGroup.part)}
        onNextPart={() => nextGroup && changePart(nextGroup.part)}
        onSubmit={() => void submit()}
      />
    </main>
  );
}

function useCountdown(expiresAt: string | undefined, offset: number, practice: boolean) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt || practice) {
      setSeconds(null);
      return;
    }
    const update = () =>
      setSeconds(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now() - offset) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, offset, practice]);
  return seconds;
}
