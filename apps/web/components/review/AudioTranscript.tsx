'use client';

import { useEffect, useRef, useState } from 'react';
import type { AudioLocator } from '../../data/deep-learning-fixtures';

type Turn = { id: string; speaker: string; de: string; vi: string; startMs: number; endMs: number };

export function AudioTranscript({ audioUrl, transcript, activeLocator }: { audioUrl?: string; transcript: Turn[]; activeLocator?: AudioLocator }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);
  function speak(text: string) { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'de-DE'; utterance.rate = speed; window.speechSynthesis.speak(utterance); }
  function seek(turn: Turn) { if (audioRef.current) { audioRef.current.currentTime = turn.startMs / 1000; void audioRef.current.play(); } else speak(turn.de); setActiveId(turn.id); }
  return <article className="audio-transcript">{audioUrl ? <audio ref={audioRef} controls preload="metadata" src={audioUrl}><track kind="captions" /></audio> : <div className="audio-fallback"><strong>Audio luyện tập</strong><span>Click vào từng dòng để nghe phát âm tiếng Đức.</span></div>}<div className="audio-speed-controls"><span>Tốc độ</span>{[.8, 1, 1.2].map((value) => <button className={speed === value ? 'is-active' : ''} type="button" key={value} onClick={() => setSpeed(value)}>{value}x</button>)}</div><div className="transcript-list">{transcript.map((turn) => <button className={activeId === turn.id || activeLocator?.transcriptId === turn.id ? 'is-active' : ''} type="button" key={turn.id} onClick={() => seek(turn)}><span><b>{turn.speaker}</b><small>{Math.round(turn.startMs / 1000)}s</small></span><span><strong>{turn.de}</strong><em>{turn.vi}</em></span></button>)}</div></article>;
}
