'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AttemptStatePayload, ExamPublicPayload, PublicQuestion, SaveAnswerPayload } from '@shd/contracts';
import { ExamHeader } from './ExamHeader';
import { ExamStimulusPane } from './ExamStimulusPane';
import { QuestionRenderer } from './questions/QuestionRenderer';
import { ReadingQuestionRenderer } from './questions/ReadingQuestionRenderer';
import styles from './ExamRoom.module.css';
import { useExamSessionStore } from './examSessionStore';

type MobilePane = 'stimulus' | 'questions';
type Section = ExamPublicPayload['sections'][number];
type RoomQuestion = PublicQuestion & { section: Section; paletteOrder: number };
type ReadingPage = { number: number; sections: Section[]; questions: RoomQuestion[]; partLabel: string };

function sectionOrder(section: Section) {
  return Math.min(...section.questions.map((question) => question.part), Number.MAX_SAFE_INTEGER);
}

function makeRoomQuestions(exam: ExamPublicPayload) {
  return exam.sections.flatMap((section) => section.questions.map((question) => ({ ...question, section }))).map((question, index) => ({ ...question, paletteOrder: index + 1 }));
}

function pageLabel(sections: Section[]) {
  const parts = [...new Set(sections.flatMap((section) => section.questions.map((question) => question.part)))].sort((a, b) => a - b);
  return parts.length ? `Teil ${parts.join(' · ')}` : 'Ngữ liệu Lesen';
}

function buildReadingPages(exam: ExamPublicPayload, allQuestions: RoomQuestion[]): ReadingPage[] {
  const sections = exam.sections.filter((section) => section.skill === 'Lesen').sort((a, b) => sectionOrder(a) - sectionOrder(b));
  if (!sections.length) return [];
  if (sections.length >= 3) {
    const groups: Section[][] = [[], [], []];
    sections.forEach((section, index) => {
      groups[Math.min(2, Math.floor((index * 3) / sections.length))]?.push(section);
    });
    return groups.filter((group) => group.length > 0).map((group, index) => ({ number: index + 1, sections: group, questions: allQuestions.filter((question) => group.includes(question.section)), partLabel: pageLabel(group) }));
  }
  const readingQuestions = allQuestions.filter((question) => question.section.skill === 'Lesen');
  const size = Math.max(1, Math.ceil(readingQuestions.length / 3));
  return [0, 1, 2].map((index) => {
    const questions = readingQuestions.slice(index * size, (index + 1) * size);
    const group = [...new Set(questions.map((question) => question.section))];
    return { number: index + 1, sections: group.length ? group : sections, questions, partLabel: pageLabel(group.length ? group : sections) };
  }).filter((page) => page.questions.length > 0);
}

const dictionary: Record<string, string> = {
  anmeldung: 'đăng ký', ausbildung: 'đào tạo nghề', bewerbung: 'đơn xin việc', erfahrung: 'kinh nghiệm', freiwilligendienst: 'dịch vụ tình nguyện', umgangsformen: 'phép tắc ứng xử', weiterbildung: 'học nâng cao', veranstaltung: 'sự kiện', umwelt: 'môi trường',
};

export function ExamRoom({ attemptId }: { attemptId: string }) {
  const [state, setState] = useState<AttemptStatePayload | null>(null);
  const [exam, setExam] = useState<ExamPublicPayload | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>('questions');
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [highlightActive, setHighlightActive] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [dictionaryTerm, setDictionaryTerm] = useState('');
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const answerRevisions = useRef(new Map<string, number>());
  const failedSaves = useRef(new Set<string>());
  const submitting = useRef(false);

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
      answerRevisions.current = new Map(nextState.answers.map((answer) => [answer.questionId, answer.revision]));
      setExam(nextExam);
      setServerOffset(new Date(nextState.serverNow).getTime() - Date.now());
      if (typeof window !== 'undefined') setNotes(window.localStorage.getItem(`shd-exam-note-${attemptId}`) ?? '');
      const scopedInitialExam = nextExam && nextState.sectionFilter !== 'all' ? { ...nextExam, sections: nextExam.sections.filter((section) => section.skill.toLowerCase() === nextState.sectionFilter) } : nextExam;
      const initialQuestions = scopedInitialExam ? makeRoomQuestions(scopedInitialExam) : [];
      const initialQuestion = initialQuestions.find((question) => question.section.skill === 'Lesen') ?? initialQuestions[0];
      setCurrentId(initialQuestion?.id ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, [attemptId]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(`shd-exam-note-${attemptId}`, notes);
  }, [attemptId, notes]);

  const scopedExam = useMemo(() => {
    if (!exam || !state || state.sectionFilter === 'all') return exam;
    return { ...exam, sections: exam.sections.filter((section) => section.skill.toLowerCase() === state.sectionFilter) };
  }, [exam, state]);
  const questions = useMemo(() => scopedExam ? makeRoomQuestions(scopedExam) : [], [scopedExam]);
  const readingPages = useMemo(() => exam ? buildReadingPages(exam, questions) : [], [exam, questions]);
  const readingMode = readingPages.length > 0;
  const currentPageIndex = readingMode ? Math.max(0, readingPages.findIndex((page) => page.questions.some((question) => question.id === currentId))) : 0;
  const activePage = readingMode ? readingPages[currentPageIndex] : undefined;
  const pageQuestions = activePage?.questions ?? questions;
  const current = pageQuestions.find((question) => question.id === currentId) ?? pageQuestions[0];
  const currentIndex = Math.max(0, pageQuestions.findIndex((question) => question.id === current?.id));
  const answerMap = useMemo(() => new Map(state?.answers.map((answer) => [answer.questionId, answer]) ?? []), [state]);
  const remainingSeconds = useCountdown(state?.expiresAt, serverOffset, state?.mode === 'practice');
  const readingQuestionIds = useMemo(() => new Set(readingPages.flatMap((page) => page.questions.map((question) => question.id))), [readingPages]);
  const roomTotalQuestions = readingMode ? readingQuestionIds.size : questions.length;
  const answeredCount = [...answerMap.entries()].filter(([questionId, answer]) => answer.selectedOption !== null && (!readingMode || readingQuestionIds.has(questionId))).length;
  const dictionaryResult = dictionary[dictionaryTerm.trim().toLowerCase()] ?? (dictionaryTerm.trim() ? 'Chưa có mục tra nhanh trong bộ từ vựng của bài này.' : 'Nhập một từ tiếng Đức để tra nghĩa.');

  function saveAnswer(questionId: string, selectedOption: string) {
    const answerValue = selectedOption.length ? selectedOption : null;
    saveQueue.current = saveQueue.current.then(async () => {
      setSaving(questionId);
      const payload: SaveAnswerPayload = { questionId, selectedOption: answerValue, revision: answerRevisions.current.get(questionId) ?? 0, timeSpentSeconds: 0 };
      const response = await fetch(`/api/v1/attempts/${attemptId}/answers`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        if (response.status === 409) {
          const refreshed = await fetch(`/api/v1/attempts/${attemptId}`, { cache: 'no-store' });
          if (refreshed.ok) {
            const freshState = (await refreshed.json()) as AttemptStatePayload;
            answerRevisions.current = new Map(freshState.answers.map((answer) => [answer.questionId, answer.revision]));
            setState(freshState);
          }
        }
        throw new Error('Chưa lưu được câu trả lời. Vui lòng chọn hoặc nhập lại trước khi nộp.');
      }
      const saved = (await response.json()) as { revision: number };
      answerRevisions.current.set(questionId, saved.revision);
      failedSaves.current.delete(questionId);
      setSaveError(failedSaves.current.size ? 'Một số câu trả lời chưa được lưu. Vui lòng chọn hoặc nhập lại.' : null);
      setState((currentState) => currentState ? { ...currentState, answers: [...currentState.answers.filter((answer) => answer.questionId !== questionId), { questionId, selectedOption: answerValue, revision: saved.revision, answeredAt: new Date().toISOString() }] } : currentState);
      setSaving(null);
    }).catch((error: unknown) => {
      failedSaves.current.add(questionId);
      setSaveError(error instanceof Error ? error.message : 'Chưa lưu được câu trả lời.');
      setSaving(null);
    });
    return saveQueue.current;
  }

  async function submit() {
    if (!state || submitted || submitting.current) return;
    submitting.current = true;
    try {
      await saveQueue.current;
      if (failedSaves.current.size) return;
      const response = await fetch(`/api/v1/attempts/${attemptId}/submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId, userAnswers: [], timeSpentPerItem: {} }) });
      if (response.ok) { setSubmitted(true); window.location.href = `/ket-qua/${attemptId}`; } else setSaveError('Chưa nộp được bài. Các câu trả lời đã lưu vẫn được giữ lại.');
    } catch { setSaveError('Mất kết nối khi nộp bài. Các câu trả lời đã lưu vẫn được giữ lại.'); } finally { submitting.current = false; }
  }

  useEffect(() => { if (remainingSeconds === 0 && state?.mode !== 'practice' && state?.status === 'in_progress' && !submitted) void submit(); }, [remainingSeconds, state?.mode, state?.status, submitted]);

  if (!state || !exam || !current) return <main className={styles.loading}>Đang mở phòng thi...</main>;

  const setPage = (pageIndex: number) => { const target = readingPages[pageIndex]; if (target?.questions[0]) setCurrentId(target.questions[0].id); };
  const previous = () => currentIndex > 0 ? setCurrentId(pageQuestions[currentIndex - 1]?.id ?? current.id) : currentPageIndex > 0 ? setPage(currentPageIndex - 1) : undefined;
  const next = () => currentIndex < pageQuestions.length - 1 ? setCurrentId(pageQuestions[currentIndex + 1]?.id ?? current.id) : currentPageIndex < readingPages.length - 1 ? setPage(currentPageIndex + 1) : void submit();
  const exit = () => { if (window.confirm('Bạn có chắc muốn rời phòng thi? Bài làm đã lưu sẽ được giữ lại.')) window.location.href = '/de-thi'; };
  const toggleFlag = () => setFlaggedIds((currentFlags) => { const nextFlags = new Set(currentFlags); if (nextFlags.has(current.id)) nextFlags.delete(current.id); else nextFlags.add(current.id); return nextFlags; });

  return <main className={styles.root}>
    <ExamHeader examTitle={exam.examMetadata.title} level={exam.examMetadata.cefrLevel} mode={state.mode} remainingSeconds={remainingSeconds} fontScale={fontScale} answeredCount={answeredCount} totalQuestions={roomTotalQuestions} saveStatus={saving ? 'saving' : saveError ? 'error' : 'saved'} bookmarked={flaggedIds.has(current.id)} readingPage={readingMode ? { current: currentPageIndex + 1, total: readingPages.length } : undefined} highlightActive={highlightActive} notesOpen={notesOpen} dictionaryOpen={dictionaryOpen} onFontScaleChange={setFontScale} onToggleBookmark={toggleFlag} onToggleHighlight={() => setHighlightActive((value) => !value)} onToggleNotes={() => { setNotesOpen((value) => !value); setDictionaryOpen(false); }} onToggleDictionary={() => { setDictionaryOpen((value) => !value); setNotesOpen(false); }} onSubmit={() => void submit()} onExit={exit} />
    {(notesOpen || dictionaryOpen) && <div className={styles.utilityBar}>{notesOpen && <label className={styles.utilityField}><span>Ghi chú cá nhân</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ghi chú chiến lược hoặc từ khóa..." /></label>}{dictionaryOpen && <label className={styles.utilityField}><span>Tra nghĩa Đức – Việt</span><div className={styles.dictionaryInput}><input value={dictionaryTerm} onChange={(event) => setDictionaryTerm(event.target.value)} placeholder="z. B. Ausbildung" autoFocus /><strong>{dictionaryResult}</strong></div></label>}</div>}
    <div className={styles.mobileTabs} role="tablist" aria-label="Khu vực bài thi"><button className={mobilePane === 'stimulus' ? styles.mobileTabActive : ''} type="button" onClick={() => setMobilePane('stimulus')}>Ngữ liệu</button><button className={mobilePane === 'questions' ? styles.mobileTabActive : ''} type="button" onClick={() => setMobilePane('questions')}>Câu hỏi</button></div>
    <div className={styles.body}><ExamStimulusPane section={current.section} examSlug={state.slug} fontScale={fontScale} highlightMode={highlightActive} mobileVisible={mobilePane === 'stimulus'} /><section className={`${styles.pane} ${styles.questionPane} ${mobilePane === 'questions' ? styles.mobileVisible : ''}`} aria-label="Câu hỏi"><div className={styles.questionTop}><div><span className={styles.questionCount}>{readingMode ? `P${currentPageIndex + 1} · ${activePage?.partLabel}` : 'Câu hỏi'}</span><h2 className={styles.questionPrompt}>Chọn đáp án phù hợp</h2></div><div className={styles.questionSaveState} aria-live="polite">{saving ? 'Đang lưu...' : saveError ?? 'Đã đồng bộ an toàn'}</div></div>{readingMode ? <ReadingQuestionRenderer question={current} displayNumber={current.paletteOrder} providerFormat={exam.examMetadata.providerFormat} selectedOption={answerMap.get(current.id)?.selectedOption} onAnswer={(optionId) => void saveAnswer(current.id, optionId)} /> : <QuestionRenderer question={current} displayNumber={current.paletteOrder} providerFormat={exam.examMetadata.providerFormat} selectedOption={answerMap.get(current.id)?.selectedOption} onAnswer={(optionId) => void saveAnswer(current.id, optionId)} />}<div className={styles.questionActions}><button className={styles.previousButton} type="button" disabled={currentIndex <= 0 && currentPageIndex <= 0} onClick={previous}>Câu trước</button><button className={styles.nextButton} type="button" onClick={next}>{currentIndex === pageQuestions.length - 1 && currentPageIndex === readingPages.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}</button></div></section></div>
    <footer className={styles.bottom}><div className={styles.bottomInfo}><strong>Tiến độ {answeredCount}/{roomTotalQuestions} câu</strong>{readingMode && <div className={styles.sectionProgress}>{readingPages.map((page) => <button key={page.number} className={page.number === currentPageIndex + 1 ? styles.sectionProgressActive : ''} type="button" onClick={() => setPage(page.number - 1)}>P{page.number}</button>)}</div>}</div><QuestionPalette questions={pageQuestions} answerMap={answerMap} currentId={current.id} flaggedIds={flaggedIds} onSelect={setCurrentId} /><div className={styles.bottomActions}>{readingMode && <button className={styles.sectionBackButton} type="button" disabled={currentPageIndex <= 0} onClick={() => setPage(currentPageIndex - 1)}>Quay lại phần trước</button>}<button className={styles.bottomNext} type="button" onClick={next}>{readingMode && currentPageIndex < readingPages.length - 1 ? 'Chuyển phần' : 'Nộp bài'}</button></div></footer>
  </main>;
}

function useCountdown(expiresAt: string | undefined, offset: number, practice = false) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => { if (!expiresAt || practice) { setSeconds(null); return; } const update = () => setSeconds(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now() - offset) / 1000))); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, [expiresAt, offset, practice]);
  return seconds;
}

function QuestionPalette({ questions, answerMap, currentId, flaggedIds, onSelect }: { questions: Array<{ id: string; paletteOrder: number }>; answerMap: Map<string, { selectedOption: string | null }>; currentId: string; flaggedIds: Set<string>; onSelect: (id: string) => void }) {
  return <nav className={styles.palette} aria-label="Danh sách câu hỏi">{questions.map((question) => <button type="button" key={question.id} aria-label={`Câu ${question.paletteOrder}${answerMap.has(question.id) ? ', đã trả lời' : ', chưa trả lời'}${flaggedIds.has(question.id) ? ', đã cắm cờ' : ''}`} className={`${styles.paletteButton} ${question.id === currentId ? styles.paletteCurrent : ''} ${answerMap.has(question.id) ? styles.paletteAnswered : ''} ${flaggedIds.has(question.id) ? styles.paletteFlagged : ''}`} onClick={() => onSelect(question.id)}>{question.paletteOrder}</button>)}</nav>;
}
