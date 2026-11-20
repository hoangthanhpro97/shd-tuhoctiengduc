'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  Square,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  BookOpen,
  Sparkles,
  Repeat,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useProtectedAudioBlobUrl } from '../exam-room/core/audioUtils';
import type {
  DiktatExercisePackage,
  DiktatSentenceItem,
  DiktatVocabularyItem,
} from '../../data/diktat-imported';

export type DiktatMode = 'dictation' | 'shadowing' | 'vocabulary';
export type DifficultyLevel = 'easy' | 'hard';

export interface DiktatWorkspaceProps {
  exercise?: DiktatExercisePackage;
  sentences?: string[];
}

function speakGerman(text: string, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function normalizeForDiff(str: string): string[] {
  return str
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/gu, '')
    .split(/\s+/u)
    .filter(Boolean);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function DiktatWorkspace({ exercise, sentences }: DiktatWorkspaceProps) {
  // Convert legacy sentences prop if exercise not provided
  const items: DiktatSentenceItem[] = useMemo(() => {
    if (exercise && exercise.items && exercise.items.length > 0) {
      return exercise.items;
    }
    if (sentences && sentences.length > 0) {
      return sentences.map((de, idx) => ({
        id: `legacy-${idx}`,
        textDe: de,
        textVi: 'Câu luyện tập chép chính tả tiếng Đức thực tế.',
        voice: 'male' as const,
        audioUrlMale: null,
        audioUrlFemale: null,
        audioUrl: '',
        wordCount: de.split(/\s+/u).length,
        vocabulary: de
          .replace(/[.,!?]/gu, '')
          .split(/\s+/u)
          .slice(0, 3)
          .map((term) => ({
            term,
            ipa: '[...]',
            meaning: 'Từ vựng trong câu luyện tập',
          })),
      }));
    }
    return [];
  }, [exercise, sentences]);

  const totalSentences = items.length;
  const packageTitle = exercise?.title || 'Phản xạ nghe chép chính tả';
  const packageLevel = exercise?.level || 'B1';

  // Navigation & Mode State
  const [mode, setMode] = useState<DiktatMode>('dictation');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');

  // Active Sentence & Audio URL
  const currentSentence = items[currentIndex];

  // Determine active raw audio URL (each sentence item has a dedicated audio recording)
  const activeRawAudioUrl = useMemo(() => {
    if (!currentSentence) return '';
    return currentSentence.audioUrl || currentSentence.audioUrlMale || currentSentence.audioUrlFemale || '';
  }, [currentSentence]);

  // Anti-IDM Protected Audio Blob URL
  const { blobUrl, isLoadingAudio } = useProtectedAudioBlobUrl(activeRawAudioUrl || undefined);

  // Audio Player State & Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);

  // User input per question
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [questionScores, setQuestionScores] = useState<Record<number, boolean>>({});

  // Accordion open states
  const [isScriptOpen, setIsScriptOpen] = useState(true);
  const [isVocabOpen, setIsVocabOpen] = useState(true);

  // Recording (for Shadowing & Vocabulary)
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordedClips, setRecordedClips] = useState<Record<string, string>>({});
  const [completedPractices, setCompletedPractices] = useState<Record<string, boolean>>({});
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Filters for Shadowing & Vocabulary modes
  const [shadowingFilter, setShadowingFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [vocabFilter, setVocabFilter] = useState<'all' | 'todo' | 'done'>('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const currentInputValue = userInputs[currentIndex] || '';
  const isCurrentChecked = checkedQuestions[currentIndex] || false;

  // Sync audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [blobUrl]);

  // Adjust playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Adjust loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Reset audio playback on sentence change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentIndex]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'dictation') return;

      if (e.key === 'F2') {
        e.preventDefault();
        handleTogglePlay();
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') {
          // If in textarea, Enter triggers check
          e.preventDefault();
          handleCheckAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentIndex, currentInputValue, blobUrl]);

  // Audio Playback Controls
  const handleTogglePlay = () => {
    if (audioRef.current && blobUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Fallback to TTS if audio playback fails
          speakGerman(currentSentence?.textDe || '', playbackSpeed);
        });
      }
    } else {
      // Fallback TTS
      speakGerman(currentSentence?.textDe || '', playbackSpeed);
    }
  };

  const handleRewind5s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleCycleSpeed = () => {
    const speeds = [0.8, 1, 1.2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Input & Check Actions
  const handleInputChange = (val: string) => {
    setUserInputs((prev) => ({ ...prev, [currentIndex]: val }));
  };

  const handleInsertChar = (char: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || '') + char,
    }));
  };

  const handleCheckAnswer = () => {
    if (!currentSentence) return;
    const targetWords = normalizeForDiff(currentSentence.textDe);
    const userWords = normalizeForDiff(currentInputValue);

    const isMatch =
      targetWords.length > 0 &&
      targetWords.length === userWords.length &&
      targetWords.every((w, i) => w.toLowerCase() === (userWords[i] || '').toLowerCase());

    setCheckedQuestions((prev) => ({ ...prev, [currentIndex]: true }));
    setQuestionScores((prev) => ({ ...prev, [currentIndex]: isMatch }));
    setIsScriptOpen(true);
  };

  const handleResetAnswer = () => {
    setUserInputs((prev) => ({ ...prev, [currentIndex]: '' }));
    setCheckedQuestions((prev) => ({ ...prev, [currentIndex]: false }));
    setQuestionScores((prev) => ({ ...prev, [currentIndex]: false }));
  };

  const handleSelectQuestion = (idx: number) => {
    if (idx >= 0 && idx < totalSentences) {
      setCurrentIndex(idx);
    }
  };

  // Word-by-word diff calculation
  const diffComparison = useMemo(() => {
    if (!currentSentence || !isCurrentChecked) return null;
    const targetWords = normalizeForDiff(currentSentence.textDe);
    const userWords = normalizeForDiff(currentInputValue);

    let matchCount = 0;
    const wordResults = targetWords.map((tWord, i) => {
      const uWord = userWords[i];
      const matched = uWord && uWord.toLowerCase() === tWord.toLowerCase();
      if (matched) matchCount++;
      return {
        targetWord: tWord,
        userWord: uWord || '',
        isCorrect: Boolean(matched),
      };
    });

    const accuracyPercent = targetWords.length > 0
      ? Math.round((matchCount / targetWords.length) * 100)
      : 0;

    return {
      wordResults,
      accuracyPercent,
      isPerfect: matchCount === targetWords.length,
    };
  }, [currentSentence, isCurrentChecked, currentInputValue]);

  // Easy mode hint
  const easyModeHint = useMemo(() => {
    if (!currentSentence || difficulty !== 'easy') return '';
    return currentSentence.textDe
      .split(/\s+/u)
      .map((w) => {
        const clean = w.replace(/[.,!?]/gu, '');
        if (clean.length <= 1) return w;
        return clean[0] + '_'.repeat(clean.length - 1);
      })
      .join(' ');
  }, [currentSentence, difficulty]);

  // MediaRecorder Voice Practice handler
  const handleToggleRecord = async (targetId: string) => {
    if (recordingId === targetId && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError('Trình duyệt của bạn chưa hỗ trợ thu âm micro.');
      return;
    }

    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        setRecordedClips((prev) => ({ ...prev, [targetId]: url }));
        setCompletedPractices((prev) => ({ ...prev, [targetId]: true }));
        setRecordingId(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingId(targetId);
    } catch {
      setRecordingError('Micro chưa được cấp quyền. Vui lòng cho phép micro trên trình duyệt.');
    }
  };

  // All unique vocabulary collected across the package for Mode 3
  const allVocabList = useMemo(() => {
    const map = new Map<string, DiktatVocabularyItem>();
    items.forEach((item) => {
      (item.vocabulary || []).forEach((v) => {
        if (!map.has(v.term.toLowerCase())) {
          map.set(v.term.toLowerCase(), v);
        }
      });
    });
    return Array.from(map.values());
  }, [items]);

  // Filtered lists for Modes 2 & 3
  const filteredShadowingItems = useMemo(() => {
    return items.filter((item) => {
      const isDone = completedPractices[`shadowing-${item.id}`];
      if (shadowingFilter === 'done') return isDone;
      if (shadowingFilter === 'todo') return !isDone;
      return true;
    });
  }, [items, shadowingFilter, completedPractices]);

  const filteredVocabList = useMemo(() => {
    return allVocabList.filter((vocab) => {
      const isDone = completedPractices[`vocab-${vocab.term}`];
      if (vocabFilter === 'done') return isDone;
      if (vocabFilter === 'todo') return !isDone;
      return true;
    });
  }, [allVocabList, vocabFilter, completedPractices]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(recordedClips).forEach((url) => URL.revokeObjectURL(url));
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, [recordedClips]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex flex-col selection:bg-[#da2527]/10 selection:text-[#da2527]">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={blobUrl || undefined} preload="metadata" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER (PHOTO 1 / 2 / 3 COMPLIANT)                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left Side: Return or Close, SHD Logo & Title */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {mode === 'dictation' ? (
            <Link
              href="/chep-chinh-ta"
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đóng phòng luyện tập"
            >
              <X size={20} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setMode('dictation')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#da2527] transition-colors py-1 px-2 hover:bg-gray-50 rounded-lg"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Quay về Chép chính tả</span>
            </button>
          )}

          <div className="h-5 w-px bg-gray-200" />

          {/* SHD Brand Badge */}
          <Link href="/" className="flex items-center gap-1 shrink-0 font-extrabold tracking-tight">
            <span className="bg-[#da2527] text-white text-xs px-1.5 py-0.5 rounded font-black">
              SHD
            </span>
            <span className="text-sm font-bold text-gray-900 hidden sm:inline">
              Tự Học Tiếng Đức
            </span>
          </Link>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          {/* Title Info */}
          <div className="min-w-0">
            {mode === 'dictation' && (
              <>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  {packageTitle}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  Audio · {totalSentences} câu · Trình độ {packageLevel}
                </p>
              </>
            )}
            {mode === 'shadowing' && (
              <>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  Luyện shadowing toàn bài
                </h1>
                <p className="text-xs text-gray-500">
                  {totalSentences} câu · Nghe và nhại giọng phản xạ
                </p>
              </>
            )}
            {mode === 'vocabulary' && (
              <>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  Luyện phát âm từ vựng
                </h1>
                <p className="text-xs text-gray-500">
                  {allVocabList.length} từ vựng trọng tâm B1
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Side Mode Switchers */}
        <div className="flex items-center gap-2">
          {mode === 'dictation' && (
            <>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Đã sao chép liên kết vào bộ nhớ tạm!');
                }}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('shadowing')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#da2527] border border-gray-300 rounded-lg px-3 py-1.5 hover:border-[#da2527]/40 hover:bg-[#da2527]/5 transition-colors"
              >
                <Mic size={13} className="text-[#da2527]" />
                <span>Shadowing</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('vocabulary')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#da2527] border border-gray-300 rounded-lg px-3 py-1.5 hover:border-[#da2527]/40 hover:bg-[#da2527]/5 transition-colors"
              >
                <BookOpen size={13} className="text-[#da2527]" />
                <span>Từ vựng</span>
              </button>
            </>
          )}

          {mode === 'shadowing' && (
            <button
              type="button"
              onClick={() => setMode('vocabulary')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#da2527] border border-gray-300 rounded-lg px-3 py-1.5 hover:border-[#da2527]/40 hover:bg-[#da2527]/5 transition-colors"
            >
              <BookOpen size={13} className="text-[#da2527]" />
              <span>Từ vựng</span>
            </button>
          )}

          {mode === 'vocabulary' && (
            <button
              type="button"
              onClick={() => setMode('shadowing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#da2527] border border-gray-300 rounded-lg px-3 py-1.5 hover:border-[#da2527]/40 hover:bg-[#da2527]/5 transition-colors"
            >
              <Mic size={13} className="text-[#da2527]" />
              <span>Shadowing</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MODE 1: CHÉP CHÍNH TẢ (DICTATION - PHOTO 1)                            */}
      {/* ========================================================================= */}
      {mode === 'dictation' && (
        <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
          {/* Collapsible Left Column: Question Palette */}
          {showQuestionPalette ? (
            <aside className="w-56 shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col gap-4 h-fit sticky top-20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Câu hỏi ({currentIndex + 1}/{totalSentences})
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuestionPalette(false)}
                  className="text-xs text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                  title="Ẩn danh sách câu hỏi"
                >
                  ✕
                </button>
              </div>

              {/* 5-Column Button Grid 1..N */}
              <div className="grid grid-cols-5 gap-2">
                {items.map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isChecked = checkedQuestions[idx];
                  const isCorrect = questionScores[idx];

                  let btnStyle = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
                  if (isCurrent) {
                    btnStyle = 'bg-[#da2527] text-white shadow-sm ring-2 ring-[#da2527]/30';
                  } else if (isChecked) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border border-rose-300';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-9 w-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status tally */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Đã làm: {Object.keys(checkedQuestions).length}/{totalSentences}</span>
                <span className="font-medium text-emerald-600">
                  Đúng: {Object.values(questionScores).filter(Boolean).length}
                </span>
              </div>
            </aside>
          ) : (
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setShowQuestionPalette(true)}
                className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs hover:border-[#da2527] transition-colors flex items-center gap-1.5"
              >
                <span>☰ Hiện danh sách câu</span>
              </button>
            </div>
          )}

          {/* Main Right Area: Dictation Card & Accordions */}
          <main className="flex-1 min-w-0 max-w-4xl flex flex-col gap-5">
            {/* CARD 1: Dictation Workspace Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs">
              {/* Card Header: Navigation Arrows & Difficulty */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      title="Câu trước"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span>
                      Câu {currentIndex + 1}/{totalSentences}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(currentIndex + 1)}
                      disabled={currentIndex === totalSentences - 1}
                      className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      title="Câu kế tiếp"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {currentSentence?.wordCount || currentSentence?.textDe.split(/\s+/u).length || 0} từ
                  </span>
                </div>

                {/* Easy | Hard Toggle */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      difficulty === 'easy'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    EASY
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      difficulty === 'hard'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    HARD
                  </button>
                </div>
              </div>

              {/* Audio Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 mb-5">
                <div className="flex items-center gap-3">
                  {/* Big Play/Pause Red Button */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    disabled={isLoadingAudio}
                    className="h-11 w-11 rounded-full bg-[#da2527] hover:bg-[#b81d20] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    title={isPlaying ? 'Tạm dừng (F2)' : 'Phát âm thanh (F2)'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                  </button>

                  {/* Replay 5 seconds */}
                  <button
                    type="button"
                    onClick={handleRewind5s}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
                    title="Tua lại 5 giây"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                {/* Scrubber & Time */}
                <div className="flex-1 min-w-[160px] flex items-center gap-2.5">
                  <span className="text-xs font-mono text-gray-500 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 10}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#da2527]"
                  />
                  <span className="text-xs font-mono text-gray-400 w-10">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls: Speed, Loop, Dual-Voice */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300"
                    title="Tốc độ phát"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      isLooping
                        ? 'bg-[#da2527]/10 text-[#da2527] border-[#da2527]/30'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
                    }`}
                    title="Lặp lại câu"
                  >
                    <Repeat size={14} />
                  </button>

                  {/* Static Voice Badge */}
                  {currentSentence && (
                    <span
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                      title={
                        currentSentence.voice === 'female' || currentSentence.audioUrl?.includes('nu-')
                          ? 'Bản thu âm giọng Nữ'
                          : 'Bản thu âm giọng Nam'
                      }
                    >
                      {currentSentence.voice === 'female' || currentSentence.audioUrl?.includes('nu-')
                        ? '♀ Giọng Nữ'
                        : '♂ Giọng Nam'}
                    </span>
                  )}
                </div>
              </div>

              {/* Easy Mode Gợi ý */}
              {difficulty === 'easy' && easyModeHint && (
                <div className="mb-3 px-3.5 py-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  <span className="font-medium text-amber-700">Gợi ý từ:</span>
                  <span className="font-mono tracking-widest">{easyModeHint}</span>
                </div>
              )}

              {/* Input Textarea Area */}
              <div className="relative mb-3">
                <textarea
                  value={currentInputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Nhập những gì bạn nghe được..."
                  rows={4}
                  className="w-full text-base p-4 pr-12 rounded-xl border border-gray-300 focus:border-[#da2527] focus:ring-2 focus:ring-[#da2527]/20 outline-hidden transition-all placeholder:text-gray-400 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => speakGerman(currentInputValue || currentSentence?.textDe || '')}
                  className="absolute right-3.5 bottom-4 p-1.5 text-gray-400 hover:text-[#da2527] transition-colors rounded-lg hover:bg-gray-100"
                  title="Nghe lại những gì bạn đã gõ"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* German Special Characters Bar */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5">
                <span className="text-xs text-gray-400 mr-1">Ký tự tiếng Đức:</span>
                {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleInsertChar(char)}
                    className="h-7 w-7 rounded-md bg-gray-100 hover:bg-[#da2527]/10 hover:text-[#da2527] text-gray-800 text-xs font-semibold transition-colors flex items-center justify-center border border-gray-200"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Footer Bar: Shortcut hint & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    ℹ
                  </span>
                  <span>Nhấn phím <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono">Enter</kbd> để kiểm tra</span>
                  <span className="text-gray-400 hidden sm:inline">· Chuyển qua Unikey Eng để tránh lỗi typing</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetAnswer}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Làm lại
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#da2527] hover:bg-[#b81d20] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Kiểm tra</span>
                  </button>
                </div>
              </div>

              {/* Diff Result Feedback Display */}
              {diffComparison && (
                <div
                  className={`mt-5 p-4 rounded-xl border text-sm transition-all ${
                    diffComparison.isPerfect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold">
                      {diffComparison.isPerfect ? (
                        <>
                          <CheckCircle2 size={18} className="text-emerald-600" />
                          <span>Xuất sắc! Bạn đã gõ chính xác 100%.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={18} className="text-amber-600" />
                          <span>Độ chính xác: {diffComparison.accuracyPercent}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Word-by-word diff highlight */}
                  <div className="text-base flex flex-wrap gap-1.5 mt-2 p-3 bg-white/80 rounded-lg border border-gray-100">
                    {diffComparison.wordResults.map((item, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          item.isCorrect
                            ? 'text-emerald-700 bg-emerald-100/60'
                            : 'text-rose-700 bg-rose-100/60 line-through'
                        }`}
                      >
                        {item.targetWord}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: Script, pronunciation & translate (Accordion 1) */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsScriptOpen(!isScriptOpen)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span>Script, pronunciation & translate</span>
                {isScriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isScriptOpen && currentSentence && (
                <div className="p-5 flex flex-col gap-4 text-sm">
                  {/* German text with clickable word pronunciation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-400 tracking-wider">
                        DEUTSCH
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Volume2 size={12} className="text-gray-400" /> Click vào từ để nghe phát âm
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-base font-semibold text-gray-900 leading-relaxed">
                      {currentSentence.textDe.split(/\s+/u).map((word, wIdx) => (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => speakGerman(word.replace(/[.,!?]/gu, ''))}
                          className="hover:text-[#da2527] hover:bg-[#da2527]/10 px-1 py-0.5 rounded transition-colors"
                          title={`Nghe phát âm "${word}"`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => speakGerman(currentSentence.textDe)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#da2527] hover:underline"
                      >
                        <Volume2 size={13} />
                        <span>Luyện shadowing câu</span>
                      </button>
                    </div>
                  </div>

                  {/* Vietnamese Translation */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
                      VIETNAMESE
                    </span>
                    <p className="text-gray-700 leading-relaxed font-normal">
                      {currentSentence.textVi}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 3: Từ hay học được (Accordion 2) */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsVocabOpen(!isVocabOpen)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span>Từ hay học được ({currentSentence?.vocabulary?.length || 0})</span>
                {isVocabOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isVocabOpen && currentSentence && (
                <div className="p-5 flex flex-col gap-3">
                  {currentSentence.vocabulary && currentSentence.vocabulary.length > 0 ? (
                    currentSentence.vocabulary.map((vocab, vIdx) => {
                      const vocabKey = `vocab-${vocab.term}`;
                      const isRecording = recordingId === vocabKey;
                      const recordedAudio = recordedClips[vocabKey];

                      return (
                        <div
                          key={vIdx}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            {/* Term & Article */}
                            <span className="font-semibold text-gray-900 text-sm">
                              {vocab.term}
                            </span>

                            {/* Voice Actions: Mic & Speaker */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleRecord(vocabKey)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  isRecording
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200/60'
                                }`}
                                title={isRecording ? 'Dừng ghi âm' : 'Ghi âm phát âm của bạn'}
                              >
                                {isRecording ? <Square size={13} /> : <Mic size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => speakGerman(vocab.term)}
                                className="p-1.5 text-gray-400 hover:text-[#da2527] hover:bg-gray-200/60 rounded-md transition-colors"
                                title="Nghe phát âm chuẩn"
                              >
                                <Volume2 size={13} />
                              </button>
                            </div>

                            {/* IPA */}
                            <span className="text-xs font-mono text-gray-500">
                              {vocab.ipa}
                            </span>
                          </div>

                          {/* Meaning */}
                          <div className="text-xs text-gray-700">
                            {vocab.meaning}
                          </div>

                          {/* Recorded Audio playback if exists */}
                          {recordedAudio && (
                            <div className="w-full pt-2 flex items-center gap-2">
                              <audio controls src={recordedAudio} className="h-7 w-48" />
                              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 size={12} /> Đã thu âm
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Không có từ vựng đặc biệt cho câu này.
                    </p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODE 2: LUYỆN SHADOWING TOÀN BÀI (PHOTO 2)                              */}
      {/* ========================================================================= */}
      {mode === 'shadowing' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
          {/* Top Filter & Heading Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Luyện shadowing toàn bài
              </h2>
              <p className="text-xs text-gray-500">
                Nghe câu mẫu, nhại giọng theo ngữ điệu người bản xứ và ghi âm đối chiếu.
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filter:</span>
              <select
                value={shadowingFilter}
                onChange={(e) => setShadowingFilter(e.target.value as 'all' | 'todo' | 'done')}
                className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-[#da2527] outline-hidden text-gray-700"
              >
                <option value="all">Tất cả ({items.length})</option>
                <option value="todo">
                  Chưa luyện ({items.filter((it) => !completedPractices[`shadowing-${it.id}`]).length})
                </option>
                <option value="done">
                  Đã luyện ({items.filter((it) => completedPractices[`shadowing-${it.id}`]).length})
                </option>
              </select>
            </div>
          </div>

          {/* Error notice if microphone denied */}
          {recordingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{recordingError}</span>
            </div>
          )}

          {/* List of Sentence Cards */}
          <div className="flex flex-col gap-3">
            {filteredShadowingItems.map((sentence, idx) => {
              const shadowKey = `shadowing-${sentence.id}`;
              const isRecording = recordingId === shadowKey;
              const recordedUrl = recordedClips[shadowKey];
              const isCompleted = completedPractices[shadowKey];

              return (
                <div
                  key={sentence.id}
                  className={`bg-white border rounded-2xl p-4 md:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span className="h-7 w-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">
                        {sentence.textDe}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {sentence.textVi}
                      </p>

                      {recordedUrl && (
                        <div className="mt-3 flex items-center gap-2">
                          <audio controls src={recordedUrl} className="h-8 w-56" />
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Đã luyện
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Speaker & Mic */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => speakGerman(sentence.textDe)}
                      className="p-2.5 text-gray-500 hover:text-[#da2527] hover:bg-gray-100 rounded-xl transition-colors"
                      title="Nghe câu mẫu"
                    >
                      <Volume2 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleRecord(shadowKey)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isRecording
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isRecording ? 'Dừng ghi âm' : 'Thu âm nhại giọng'}
                    >
                      {isRecording ? (
                        <>
                          <Square size={13} />
                          <span>Dừng</span>
                        </>
                      ) : (
                        <>
                          <Mic size={13} />
                          <span>{isCompleted ? 'Thu lại' : 'Thu âm'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredShadowingItems.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-200">
                Không tìm thấy câu nào theo bộ lọc hiện tại.
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. MODE 3: LUYỆN PHÁT ÂM TỪ VỰNG (PHOTO 3)                                 */}
      {/* ========================================================================= */}
      {mode === 'vocabulary' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
          {/* Top Filter & Heading Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Tất cả từ hay trong bài ({allVocabList.length})
              </h2>
              <p className="text-xs text-gray-500">
                Luyện chuẩn hóa phát âm từng từ vựng B1 theo chuẩn IPA.
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filter:</span>
              <select
                value={vocabFilter}
                onChange={(e) => setVocabFilter(e.target.value as 'all' | 'todo' | 'done')}
                className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-[#da2527] outline-hidden text-gray-700"
              >
                <option value="all">Tất cả ({allVocabList.length})</option>
                <option value="todo">
                  Chưa luyện ({allVocabList.filter((v) => !completedPractices[`vocab-${v.term}`]).length})
                </option>
                <option value="done">
                  Đã luyện ({allVocabList.filter((v) => completedPractices[`vocab-${v.term}`]).length})
                </option>
              </select>
            </div>
          </div>

          {/* List of Vocabulary Cards */}
          <div className="flex flex-col gap-3">
            {filteredVocabList.map((vocab, idx) => {
              const vocabKey = `vocab-${vocab.term}`;
              const isRecording = recordingId === vocabKey;
              const recordedUrl = recordedClips[vocabKey];
              const isCompleted = completedPractices[vocabKey];

              return (
                <div
                  key={`${vocab.term}-${idx}`}
                  className={`bg-white border rounded-2xl p-4 md:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span className="h-7 w-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-bold text-gray-900">
                          {vocab.term}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleRecord(vocabKey)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isRecording
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title={isRecording ? 'Dừng ghi âm' : 'Thu âm phát âm của bạn'}
                          >
                            {isRecording ? <Square size={13} /> : <Mic size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => speakGerman(vocab.term)}
                            className="p-1.5 text-gray-400 hover:text-[#da2527] hover:bg-gray-100 rounded-md transition-colors"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>

                        <span className="text-xs font-mono text-gray-500">
                          {vocab.ipa}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-1">
                        {vocab.meaning}
                      </p>

                      {recordedUrl && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <audio controls src={recordedUrl} className="h-7 w-48" />
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Đã luyện
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredVocabList.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-200">
                Không tìm thấy từ vựng nào theo bộ lọc hiện tại.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
