'use client';

import { useState } from 'react';
import { getTopicVisual } from '../../lib/topic-visuals';

export interface DynamicTopicThumbnailProps {
  skill: 'horen' | 'lesen' | 'sprechen' | 'schreiben' | 'diktat';
  title: string;
  badgeText?: string;
  itemKey?: string;
  topLeftText?: string;
  eager?: boolean;
  flat?: boolean;
}

const skillLabels: Record<DynamicTopicThumbnailProps['skill'], string> = {
  horen: 'Hören',
  lesen: 'Lesen',
  sprechen: 'Sprechen',
  schreiben: 'Schreiben',
  diktat: 'Diktat',
};

export function DynamicTopicThumbnail({
  skill,
  title,
  badgeText,
  itemKey,
  topLeftText,
  eager = false,
  flat = false,
}: DynamicTopicThumbnailProps) {
  const visual = getTopicVisual(skill, title, itemKey);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`group relative aspect-video w-full select-none overflow-hidden ${
        flat
          ? 'rounded-xl bg-[#f3f2ef]'
          : topLeftText
            ? 'rounded-xl bg-slate-100'
            : 'rounded-2xl bg-slate-100 shadow-sm'
      }`}
    >
      {!imgFailed ? (
        <img
          src={visual.imageUrl}
          alt={title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full transform object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f3f2ef] text-xs font-extrabold tracking-widest text-slate-400 uppercase">
          {skillLabels[skill]}
        </div>
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          flat ? 'from-slate-950/35 via-transparent to-slate-950/15' : visual.overlayGradient
        }`}
      />
      <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
        <span
          className={
            topLeftText || flat
              ? 'rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800'
              : 'rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm'
          }
        >
          {topLeftText ?? skillLabels[skill]}
        </span>
        {(skill !== 'diktat' || Boolean(badgeText)) && (
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
              topLeftText || flat ? 'bg-slate-900/75' : `${visual.badgeColor} backdrop-blur-sm`
            }`}
          >
            {badgeText ?? 'Bài học'}
          </span>
        )}
      </div>
    </div>
  );
}
