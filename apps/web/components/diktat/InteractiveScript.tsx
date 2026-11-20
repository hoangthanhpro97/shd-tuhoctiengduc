'use client';

import styles from './DiktatWorkspace.module.css';

export function InteractiveScript({ text, onSpeak }: { text: string; onSpeak: (word: string) => void }) {
  return <details className={styles.script}><summary>Script tiếng Đức · Click từng từ để nghe</summary><div className={styles.scriptWords}>{text.split(/(\s+)/u).map((word, index) => word.trim() ? <button type="button" key={`${word}-${index}`} onClick={() => onSpeak(word.replace(/[.,!?]/gu, ''))}>{word}</button> : <span key={`${word}-${index}`}>{word}</span>)}</div></details>;
}
