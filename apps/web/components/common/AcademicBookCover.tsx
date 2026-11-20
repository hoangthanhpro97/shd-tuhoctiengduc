import { BookOpen } from 'lucide-react';

export function AcademicBookCover({ title, level, profile, pattern = 'book', badgeLabel, thumbnailUrl, partCount }: { title: string; level: string; profile: string; pattern?: 'book' | 'scenic' | 'minimal'; badgeLabel?: string; thumbnailUrl?: string; partCount?: number }) {
  return <div className={`academic-book-cover pattern-${pattern}`} style={thumbnailUrl ? { backgroundImage: `linear-gradient(135deg, rgba(16,24,40,.22), rgba(16,24,40,.78)), url(${thumbnailUrl})` } : undefined}><span className="book-cover-level">{level}</span><BookOpen size={22} /><div><small>{badgeLabel ?? profile}</small><strong>{title}</strong>{partCount && <em>{partCount} phần luyện</em>}</div></div>;
}
