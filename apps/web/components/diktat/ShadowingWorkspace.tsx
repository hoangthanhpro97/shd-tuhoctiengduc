'use client';

import { Mic, Play, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ShadowingWorkspace({ sentences }: { sentences: Array<{ de: string; vi: string }> }) {
  const [active, setActive] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordingsRef = useRef(recordings);
  useEffect(() => { recordingsRef.current = recordings; }, [recordings]);
  useEffect(() => () => Object.values(recordingsRef.current).forEach((url) => URL.revokeObjectURL(url)), []);
  async function toggle(index: number) {
    if (active === index && recorder.current) { recorder.current.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return;
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return; }
    chunks.current = [];
    const next = new MediaRecorder(stream);
    next.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
    next.onstop = () => { setRecordings((current) => ({ ...current, [index]: URL.createObjectURL(new Blob(chunks.current, { type: next.mimeType || 'audio/webm' })) })); stream.getTracks().forEach((track) => track.stop()); setActive(null); };
    recorder.current = next;
    next.start();
    setActive(index);
  }
  return <div className="shadowing-panel"><p className="eyebrow">Shadowing</p>{sentences.map((sentence, index) => <article className="shadowing-row" key={`${sentence.de}-${index}`}><div><strong>{sentence.de}</strong><small>{sentence.vi}</small></div><div className="shadowing-actions"><button className="button button-quiet" type="button" onClick={() => { const utterance = new SpeechSynthesisUtterance(sentence.de); utterance.lang = 'de-DE'; window.speechSynthesis?.speak(utterance); }}><Play size={13} /> Nghe mẫu</button><button className="button button-quiet" type="button" onClick={() => void toggle(index)}>{active === index ? <><Square size={13} /> Dừng</> : <><Mic size={13} /> Thu âm</>}</button>{recordings[index] && <audio controls src={recordings[index]} />}</div></article>)}</div>;
}
