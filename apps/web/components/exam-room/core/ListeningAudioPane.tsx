'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  FileText,
  Languages,
  Headphones,
  Lock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type {
  WorkstationListeningStimulus,
  WorkstationPolicy,
  WorkstationSection,
} from './types';
import { resolveExamAudioUrl, useProtectedAudioBlobUrl } from './audioUtils';
import styles from '../ExamRoom.module.css';

export interface ListeningAudioPaneProps {
  section: WorkstationSection;
  examSlug?: string;
  level?: string;
  fontScale: number;
  policy: WorkstationPolicy;
  isLoggedIn?: boolean;
  onTriggerNote?: (quote: string) => void;
  onTriggerLookup?: (text: string) => void;
  onAddHighlight?: (text: string, color: 'yellow' | 'green' | 'pink') => void;
}

const WAVEFORM_BAR_COUNT = 52;

/**
 * Generates an organic, realistic speech-envelope waveform profile per Teil.
 * Deterministic so there are no SSR hydration mismatches.
 */
function buildWaveformProfile(part: number): number[] {
  const seed = part * 17 + 11;
  return Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
    const t = i / WAVEFORM_BAR_COUNT;
    // Speech phrase bursts + micro pauses
    const phrase = Math.abs(Math.sin(t * Math.PI * (3.2 + (part % 3)) + seed * 0.13));
    const syllable = Math.abs(Math.cos(i * 0.72 + seed * 0.41));
    const detail = Math.abs(Math.sin(i * 1.63 + part * 2.1));
    // Fade slightly at very beginning and very end like real exam tracks
    const edgeEnvelope = Math.sin(Math.min(1, Math.max(0.06, t)) * Math.PI);
    const raw = (0.28 + 0.44 * phrase + 0.18 * syllable + 0.1 * detail) * (0.55 + 0.45 * edgeEnvelope);
    return Math.round(Math.max(18, Math.min(96, raw * 100)));
  });
}

const TEIL_BRIEFS: Record<number, { summary: string; detail: string; isSinglePlayWarning?: boolean }> = {
  1: {
    summary: '5 đoạn thông báo ngắn (Text 1–5) · 10 câu hỏi',
    detail: 'Mỗi đoạn nghe tương ứng 1 câu Richtig/Falsch và 1 câu trắc nghiệm A/B/C. Bạn được nghe 2 lần.',
  },
  2: {
    summary: '1 bài thuyết minh / hướng dẫn · 5 câu A/B/C',
    detail: 'Các câu hỏi đi theo đúng trình tự thời gian của bài nói. Đọc trước từ khóa trước khi phát.',
  },
  3: {
    summary: '1 đoạn hội thoại đời sống · 7 câu Richtig/Falsch',
    detail: 'Lưu ý: Teil 3 chỉ được nghe 1 lần duy nhất! Hãy đọc kỹ toàn bộ 7 câu hỏi bên phải trước khi bấm Phát.',
    isSinglePlayWarning: true,
  },
  4: {
    summary: '1 buổi thảo luận Radio (3 nhân vật) · 8 câu Zuordnung',
    detail: 'Phân biệt vai trò và giọng nói của Moderator cùng 2 khách mời để nối đúng ý kiến. Nghe 2 lần.',
  },
};

export function ListeningAudioPane({
  section,
  examSlug,
  level = 'B1',
  fontScale,
  policy,
  isLoggedIn = true,
  onTriggerNote,
  onTriggerLookup,
  onAddHighlight: _onAddHighlight,
}: ListeningAudioPaneProps) {
  const stimulus =
    section.stimulus?.type === 'audio'
      ? (section.stimulus as WorkstationListeningStimulus)
      : undefined;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [waveTick, setWaveTick] = useState(0);
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null);

  const maxPlayCount = stimulus?.playCount ?? (section.part === 3 ? 1 : 2);
  const enforceMaxPlayCount = stimulus?.audioIncludesRepetition ? 1 : maxPlayCount;

  // Transcript state
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(false);

  // Resolve real audio URL
  const resolvedAudioUrl = resolveExamAudioUrl({
    audioUrl: stimulus?.audioUrl,
    examSlug,
    part: section.part,
    level,
  });

  const { blobUrl, isLoadingAudio, audioFetchError } = useProtectedAudioBlobUrl(resolvedAudioUrl);

  // Base waveform bars for this Teil
  const baseBars = useMemo(() => buildWaveformProfile(section.part), [section.part]);

  // Reset audio state on section change or when a new blob URL is mounted
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayCount(0);
    setAudioError(false);
    setHoverBarIndex(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (blobUrl) {
        audioRef.current.load();
      }
    }
  }, [section.part, blobUrl]);

  // Keep audio element volume / muted / playbackRate synced
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // Gentle real-time waveform breathing animation while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setWaveTick((t) => (t + 1) % 360);
    }, 110);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const playLocked = policy.enforcePlayCount && playCount >= enforceMaxPlayCount;

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !blobUrl || isLoadingAudio) return;
    if (policy.enforcePlayCount && playCount >= enforceMaxPlayCount && !isPlaying) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => {
          setAudioError(true);
          setIsPlaying(false);
        });
    }
  }, [blobUrl, enforceMaxPlayCount, isLoadingAudio, isPlaying, playCount, policy.enforcePlayCount]);

  // Keyboard shortcut: Space toggles play/pause when not typing in input/textarea
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay]);

  // Skip -5s / +5s in practice mode
  const skipSeconds = (delta: number) => {
    if (!audioRef.current || !policy.allowSeekAudio) return;
    const next = Math.max(0, Math.min(duration || 0, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  // Speed change
  const changeSpeed = (speed: number) => {
    if (!audioRef.current || !policy.allowSeekAudio) return;
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  // Waveform click-to-seek (in practice mode)
  const handleWaveformClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!policy.allowSeekAudio || !audioRef.current || !duration || !waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const targetTime = ratio * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Handle Audio Ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlayCount((prev) => prev + 1);
  };

  // Text selection on German transcript
  const handleTranscriptMouseUp = () => {
    if (!isLoggedIn) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const selectedText = sel.toString().trim();
    if (selectedText.length > 1) {
      if (onTriggerLookup && selectedText.split(/\s+/).length <= 4) {
        onTriggerLookup(selectedText);
      } else if (onTriggerNote) {
        onTriggerNote(selectedText);
      }
    }
  };

  const formatAudioTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const activeBarIndex = Math.floor(progressRatio * WAVEFORM_BAR_COUNT);
  const hoverTimeSeconds =
    hoverBarIndex !== null && duration > 0
      ? ((hoverBarIndex + 0.5) / WAVEFORM_BAR_COUNT) * duration
      : null;

  const brief = TEIL_BRIEFS[section.part] ?? TEIL_BRIEFS[1];
  const isSinglePlay = maxPlayCount === 1;

  return (
    <div
      className={`${styles.pane} flex h-full flex-col bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50`}
      style={{ '--stimulus-scale': fontScale } as CSSProperties}
      aria-label={`Ngữ liệu nghe Teil ${section.part}`}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={blobUrl || undefined}
        preload="auto"
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
            setAudioError(false);
          }
        }}
        onError={() => {
          if (blobUrl) setAudioError(true);
        }}
        onEnded={handleAudioEnded}
      />

      {/* ================= COMPACT TOP META STRIP ================= */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white/90 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-extrabold tracking-wide text-[#da2527]">
            <Headphones size={13} />
            HÖREN · TEIL {section.part}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
              isSinglePlay
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {isSinglePlay && <AlertTriangle size={11} className="text-amber-600" />}
            {maxPlayCount}× hören
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {policy.allowSeekAudio ? (
            <span>Chế độ luyện tập · Tua tự do</span>
          ) : (
            <>
              <Lock size={11} className="text-slate-400" />
              <span>Chuẩn phòng thi · Khóa tua</span>
            </>
          )}
        </span>
      </div>

      {/* ================= CENTERED STUDIO WAVEFORM WORKSPACE ================= */}
      <div
        className={`flex flex-1 flex-col items-center px-5 py-6 sm:px-8 ${
          transcriptOpen ? 'justify-start' : 'justify-center'
        }`}
      >
        <div className="w-full max-w-[540px]">
          {/* MAIN CENTERED WAVEFORM PLAYER CARD */}
          <div
            data-testid="hoeren-waveform-card"
            className={`relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 sm:p-7 ${
              isPlaying
                ? 'border-[#da2527]/35 shadow-[0_14px_38px_-10px_rgba(218,37,39,0.16)]'
                : 'border-slate-200/90 shadow-[0_8px_28px_-8px_rgba(15,23,42,0.08)]'
            }`}
          >
            {/* Subtle top red accent bar */}
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1 transition-colors duration-300 ${
                isPlaying ? 'bg-gradient-to-r from-[#da2527] via-[#f87171] to-[#da2527]' : 'bg-slate-200/80'
              }`}
            />

            {/* Centered Track Title (gọn sạch, không lặp lại phụ đề Teil) */}
            <div className="text-center">
              <h2 className="m-0 text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[19px]">
                {stimulus?.title ?? section.title}
              </h2>
            </div>

            {/* Status & Visual Play-Count Pips */}
            <div className="mt-5 flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <span className="relative flex h-2.5 w-2.5">
                  {isPlaying && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#da2527] opacity-65" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      audioError || audioFetchError
                        ? 'bg-rose-500'
                        : isPlaying
                          ? 'bg-[#da2527]'
                          : isLoadingAudio
                            ? 'bg-amber-400 animate-pulse'
                            : playLocked
                              ? 'bg-emerald-500'
                              : currentTime > 0
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                    }`}
                  />
                </span>
                <span>
                  {audioError || audioFetchError
                    ? 'Không tải được file âm thanh'
                    : isLoadingAudio
                      ? 'Đang chuẩn bị âm thanh...'
                      : isPlaying
                        ? 'Đang phát âm thanh...'
                        : playLocked
                          ? 'Đã hoàn tất lượt nghe'
                          : currentTime > 0
                            ? 'Đang tạm dừng'
                            : 'Sẵn sàng phát'}
                </span>
              </span>

              {policy.enforcePlayCount && (
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1">
                  <span className="text-[11px] font-semibold text-slate-500">Lượt nghe</span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    {Array.from({ length: enforceMaxPlayCount }).map((_, idx) => {
                      const used = idx < playCount;
                      const activeNow = isPlaying && idx === playCount;
                      return (
                        <span
                          key={idx}
                          className={`h-2 w-2 rounded-full transition-all ${
                            used
                              ? 'bg-[#da2527]'
                              : activeNow
                                ? 'bg-[#da2527] ring-2 ring-[#da2527]/30 animate-pulse'
                                : 'bg-slate-300'
                          }`}
                        />
                      );
                    })}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-800">
                    {playCount}/{enforceMaxPlayCount}
                  </span>
                </div>
              )}
            </div>

            {/* ================= AUDIO WAVEFORM VISUALIZER ================= */}
            <div className="relative mt-4">
              {/* Floating hover timestamp tooltip in practice mode */}
              {policy.allowSeekAudio && hoverBarIndex !== null && hoverTimeSeconds !== null && (
                <div
                  className="pointer-events-none absolute -top-7 z-20 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm"
                  style={{
                    left: `${((hoverBarIndex + 0.5) / WAVEFORM_BAR_COUNT) * 100}%`,
                  }}
                >
                  {formatAudioTime(hoverTimeSeconds)}
                </div>
              )}

              <div
                ref={waveformRef}
                role="slider"
                aria-label="Sóng âm thanh bài nghe"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                aria-disabled={!policy.allowSeekAudio}
                data-testid="audio-waveform"
                onClick={handleWaveformClick}
                onMouseLeave={() => setHoverBarIndex(null)}
                className={`flex h-[88px] w-full items-center justify-between gap-[3px] rounded-2xl border px-4 py-3 transition-colors ${
                  isPlaying
                    ? 'border-red-100 bg-gradient-to-b from-[#fff7f7] to-slate-50/90'
                    : 'border-slate-200/80 bg-slate-50/80'
                } ${policy.allowSeekAudio ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {baseBars.map((baseHeight, idx) => {
                  const isPlayed = duration > 0 && idx < activeBarIndex;
                  const isHead = duration > 0 && idx === activeBarIndex && (isPlaying || currentTime > 0);
                  const isHoverPreview =
                    policy.allowSeekAudio && hoverBarIndex !== null && idx <= hoverBarIndex;

                  // Live acoustic modulation around playhead when playing
                  let displayHeight = baseHeight;
                  if (isPlaying) {
                    const distFromHead = Math.abs(idx - activeBarIndex);
                    const liveWave = Math.sin(waveTick * 0.65 + idx * 0.55) * 14;
                    const proximityBoost = distFromHead <= 4 ? 10 : 0;
                    displayHeight = Math.max(
                      16,
                      Math.min(98, baseHeight + liveWave * (distFromHead <= 8 ? 1 : 0.45) + proximityBoost)
                    );
                  }

                  let barColor = 'bg-slate-300/85';
                  if (isHead) {
                    barColor = 'bg-[#da2527] shadow-[0_0_8px_rgba(218,37,39,0.5)]';
                  } else if (isPlayed) {
                    barColor = 'bg-[#da2527]';
                  } else if (isHoverPreview) {
                    barColor = 'bg-[#da2527]/45';
                  }

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => policy.allowSeekAudio && setHoverBarIndex(idx)}
                      className="flex h-full flex-1 items-center justify-center"
                    >
                      <span
                        className={`block w-full max-w-[5px] rounded-full transition-all duration-150 ${barColor}`}
                        style={{ height: `${displayHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Time readout beneath waveform */}
              <div className="mt-2 flex items-center justify-between px-1 font-mono text-[11px] font-semibold">
                <span className={isPlaying ? 'text-[#da2527]' : 'text-slate-600'}>
                  {formatAudioTime(currentTime)}
                </span>
                <span className="text-slate-400">
                  {duration > 0 ? formatAudioTime(duration) : '--:--'}
                </span>
              </div>
            </div>

            {/* ================= CENTERED STUDIO CONTROLS ================= */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              {/* Left cluster: Volume control (always usable in exam & practice!) */}
              <div className="flex flex-1 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  aria-label={isMuted ? 'Bật âm lượng' : 'Tắt âm lượng'}
                  title={isMuted ? 'Bật âm lượng' : 'Tắt âm lượng'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={16} className="text-slate-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    if (val > 0 && isMuted) setIsMuted(false);
                  }}
                  aria-label="Điều chỉnh âm lượng"
                  className="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#da2527] sm:block"
                />
              </div>

              {/* Center cluster: Rewind (-5s practice) + BIG CIRCULAR PLAY BUTTON + Forward (+5s practice) */}
              <div className="flex items-center justify-center gap-3">
                {policy.allowSeekAudio && (
                  <button
                    type="button"
                    onClick={() => skipSeconds(-5)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    title="Tua lại 5 giây"
                    aria-label="Tua lại 5 giây"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={playLocked || isLoadingAudio}
                  data-testid="hoeren-play-button"
                  aria-label={
                    isPlaying
                      ? 'Tạm dừng audio'
                      : playLocked
                        ? 'Hết lượt nghe'
                        : isLoadingAudio
                          ? 'Đang chuẩn bị âm thanh'
                          : 'Phát audio'
                  }
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-200 ${
                    playLocked
                      ? 'cursor-not-allowed bg-slate-300 shadow-none'
                      : isLoadingAudio
                        ? 'cursor-wait bg-slate-400 opacity-80 shadow-none'
                        : isPlaying
                          ? 'bg-[#da2527] shadow-[0_10px_24px_-4px_rgba(218,37,39,0.5)] ring-4 ring-red-100 hover:scale-105 hover:bg-[#b81e20] active:scale-95'
                          : 'bg-[#da2527] shadow-[0_10px_24px_-4px_rgba(218,37,39,0.45)] hover:scale-105 hover:bg-[#b81e20] active:scale-95'
                  }`}
                >
                  {isPlaying ? (
                    <Pause size={22} fill="currentColor" />
                  ) : (
                    <Play size={22} fill="currentColor" className="translate-x-0.5" />
                  )}
                </button>

                {policy.allowSeekAudio && (
                  <button
                    type="button"
                    onClick={() => skipSeconds(5)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    title="Tua tới 5 giây"
                    aria-label="Tua tới 5 giây"
                  >
                    <RotateCw size={16} />
                  </button>
                )}
              </div>

              {/* Right cluster: Speed pills (practice) OR keyboard hint (exam) */}
              <div className="flex flex-1 items-center justify-end">
                {policy.allowSeekAudio ? (
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
                    {[0.85, 1.0, 1.15].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => changeSpeed(speed)}
                        className={`rounded-lg px-2 py-1 transition-all ${
                          playbackSpeed === speed
                            ? 'bg-white text-[#da2527] shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="hidden items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 sm:inline-flex">
                    <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                      Space
                    </kbd>
                    <span>Phát / Dừng</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ================= TEIL CONTEXT & EXAM BRIEF CARD ================= */}
          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border p-3.5 text-xs leading-relaxed ${
              brief.isSinglePlayWarning
                ? 'border-amber-200/90 bg-amber-50/75 text-amber-950'
                : 'border-slate-200/80 bg-white/85 text-slate-600'
            }`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                brief.isSinglePlayWarning
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {brief.isSinglePlayWarning ? <AlertTriangle size={14} /> : <Info size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <strong
                className={`block text-xs font-bold ${
                  brief.isSinglePlayWarning ? 'text-amber-900' : 'text-slate-800'
                }`}
              >
                {brief.summary}
              </strong>
              <p className="mt-0.5 mb-0 text-[11px] leading-relaxed opacity-90">{brief.detail}</p>
            </div>
          </div>

          {/* ================= BILINGUAL TRANSCRIPT (PRACTICE MODE ONLY) ================= */}
          {policy.showTranscriptToggle && (
            <div className="mt-4 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/80 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setTranscriptOpen((v) => !v)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-900"
                >
                  <FileText size={14} />
                  <span>Hörtext (Transcript phân vai song ngữ Đức – Việt)</span>
                  <span className="text-[10px] text-indigo-600">
                    {transcriptOpen ? '▲ Thu gọn' : '▼ Mở rộng'}
                  </span>
                </button>

                {transcriptOpen && (
                  <button
                    type="button"
                    onClick={() => setShowVietnamese((v) => !v)}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      showVietnamese
                        ? 'bg-indigo-600 text-white'
                        : 'border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <Languages size={12} />
                    <span>{showVietnamese ? 'Ẩn bản dịch tiếng Việt' : 'Hiện bản dịch tiếng Việt'}</span>
                  </button>
                )}
              </div>

              {transcriptOpen && (
                <div
                  className="max-h-96 space-y-3 overflow-y-auto p-4 text-xs leading-relaxed"
                  onMouseUp={handleTranscriptMouseUp}
                >
                  {stimulus?.transcriptTurns?.length ? (
                    stimulus.transcriptTurns.map((turn, idx) => {
                      const isRight = turn.roleSide === 'right';
                      return (
                        <div
                          key={`${turn.speakerId}-${idx}`}
                          className={`flex flex-col gap-0.5 rounded-lg p-2.5 transition-colors hover:bg-white/80 ${
                            isRight
                              ? 'border-r-2 border-indigo-400 bg-white/50 pl-3'
                              : 'border-l-2 border-slate-300 bg-white/50 pr-3'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <span className="text-[11px] text-indigo-700">{turn.speakerName}</span>
                            {turn.timestampStart !== undefined && (
                              <span className="font-mono text-[10px] text-slate-400">
                                [{formatAudioTime(turn.timestampStart)}]
                              </span>
                            )}
                          </div>
                          <p className="select-text text-slate-800">{turn.textDe}</p>
                          {showVietnamese && turn.textVi && (
                            <p className="mt-0.5 select-text italic text-slate-500">{turn.textVi}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="italic text-slate-500">
                      Bản ghi lời thoại (Hörtext) đang được cập nhật cho phần nghe này.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
