import { getTopicVisual } from '../../lib/topic-visuals';

export interface DynamicTopicThumbnailProps {
  skill: 'horen' | 'lesen' | 'sprechen' | 'schreiben' | 'diktat';
  title: string;
  badgeText?: string;
  itemKey?: string;
  topLeftText?: string;
}

const skillLabels: Record<DynamicTopicThumbnailProps['skill'], string> = {
  horen: 'Hören',
  lesen: 'Lesen',
  sprechen: 'Sprechen',
  schreiben: 'Schreiben',
  diktat: 'Diktat',
};

export function DynamicTopicThumbnail({ skill, title, badgeText, itemKey, topLeftText }: DynamicTopicThumbnailProps) {
  const visual = getTopicVisual(skill, title, itemKey);

  return <div className={`group relative aspect-video w-full select-none overflow-hidden ${topLeftText ? 'rounded-xl bg-slate-100' : 'rounded-2xl bg-slate-900 shadow-sm'}`}>
    <img src={visual.imageUrl} alt={title} className="absolute inset-0 h-full w-full transform object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" decoding="async" />
    <div className={`absolute inset-0 bg-gradient-to-t ${visual.overlayGradient}`} />
    <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
      <span className={topLeftText ? 'rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow-xs' : 'rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm'}>{topLeftText ?? skillLabels[skill]}</span>
      {(skill !== 'diktat' || Boolean(badgeText)) && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm ${topLeftText ? 'bg-slate-900/75' : visual.badgeColor}`}>{badgeText ?? 'Bài học'}</span>}
    </div>
  </div>;
}
