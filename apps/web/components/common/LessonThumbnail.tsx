import { AudioLines, BookOpen, PenLine } from 'lucide-react';

export function LessonThumbnail({ skill, level, title, pattern = 'reading', topic }: { skill: 'Hoeren' | 'Lesen' | 'Diktat'; level: string; title: string; pattern?: 'audio' | 'reading' | 'dictation'; topic?: string }) {
  const Icon = pattern === 'audio' ? AudioLines : pattern === 'dictation' ? PenLine : BookOpen;
  return <div className={`lesson-thumbnail lesson-${pattern}`}><Icon size={24} /><span>{level}</span><strong>{title}</strong>{topic && <small>{topic}</small>}{skill === 'Diktat' && <em>Diktat</em>}</div>;
}
