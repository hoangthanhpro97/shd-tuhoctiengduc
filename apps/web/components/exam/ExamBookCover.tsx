'use client';

import { useState } from 'react';

export interface ExamBookCoverProps {
  level: 'A1' | 'A2' | 'B1' | 'B2';
  provider: 'goethe' | 'osd' | 'telc';
  simulationNumber: string;
  title: string;
  className?: string;
  stageClassName?: string;
  coverImageUrl?: string;
}

// Rotating photo gallery for ÖSD (Vienna / Austrian academic & cultural context)
const osdPhotos = [
  'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=480&q=80', // Tập 01: Classical Vienna architecture in bright sunlight
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=480&q=80', // Tập 02: International students discussing lessons
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=480&q=80', // Tập 03: European university library filled with light
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=480&q=80', // Tập 04: Study desk with notebook, pen and morning coffee
];

// Rotating photo gallery for Goethe & telc (Germany & test preparation context)
const goetheTelcPhotos = [
  'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=480&q=80', // Tập 01: Brandenburg Gate Berlin clear blue sky
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=480&q=80', // Tập 02: Two friends practicing & reviewing with laptop
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=480&q=80', // Tập 03: Textbook open on bright wooden table
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=480&q=80', // Tập 04: Peaceful old town street in Germany
];

const providerThemes = {
  osd: {
    accentColor: '#0284c7',
    spineGradient: 'from-[#0284c7] to-[#38bdf8]',
    levelColor: '#0369a1',
    badgeBg: '#e0f2fe',
    badgeText: '#0284c7',
    glow: 'bg-sky-400/25',
    pastelWash: 'from-sky-50/70 via-sky-50/20 to-transparent',
    fallbackGradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]',
    stampAccents: ['#fbbf24', '#34d399', '#fb7185', '#38bdf8'],
  },
  goethe: {
    accentColor: '#16a34a',
    spineGradient: 'from-[#15803d] to-[#4ade80]',
    levelColor: '#166534',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    glow: 'bg-emerald-400/25',
    pastelWash: 'from-emerald-50/70 via-emerald-50/20 to-transparent',
    fallbackGradient: 'from-[#16a34a] via-[#15803d] to-[#166534]',
    stampAccents: ['#fde047', '#fdba74', '#86efac', '#fef08a'],
  },
  telc: {
    accentColor: '#da2527',
    spineGradient: 'from-[#b91c1c] to-[#f87171]',
    levelColor: '#b91c1c',
    badgeBg: '#fee2e2',
    badgeText: '#da2527',
    glow: 'bg-rose-400/25',
    pastelWash: 'from-rose-50/70 via-rose-50/20 to-transparent',
    fallbackGradient: 'from-[#b91c1c] via-[#991b1b] to-[#7f1d1d]',
    stampAccents: ['#facc15', '#f87171', '#fb923c', '#fef2f2'],
  },
};

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function parseVolumeIndex(simulationNumber: string, title: string): number {
  const titleTapMatch = title.match(/tập\s*(\d+)/i)?.[1];
  if (titleTapMatch) {
    const n = Number.parseInt(titleTapMatch, 10);
    if (!Number.isNaN(n) && n > 0) return (n - 1) % 4;
  }
  const numMatch = simulationNumber.match(/\d+/)?.[0];
  if (numMatch) {
    const n = Number.parseInt(numMatch, 10);
    if (!Number.isNaN(n) && n > 0) return (n - 1) % 4;
  }
  const anyNumMatch = title.match(/(?:-|_|\s)(\d+)\b/)?.[1];
  if (anyNumMatch) {
    const n = Number.parseInt(anyNumMatch, 10);
    if (!Number.isNaN(n) && n > 0) return (n - 1) % 4;
  }
  return 0;
}

export function ExamBookCover({
  level,
  provider,
  simulationNumber,
  title,
  className,
  stageClassName,
  coverImageUrl,
}: ExamBookCoverProps) {
  const [imgError, setImgError] = useState(false);

  const theme = providerThemes[provider];
  const volumeIndex = parseVolumeIndex(simulationNumber, title);

  // Raw volume string for display (TẬP 01..TẬP 04)
  const rawVolNum = title.match(/tập\s*(\d+)/i)?.[1] ?? simulationNumber.match(/\d+/)?.[0] ?? '1';
  const formattedVolume = String(Number.parseInt(rawVolNum, 10) || volumeIndex + 1).padStart(2, '0');

  // Test number for stamp (MODELLSATZ 01 / 02 ...)
  const formattedSimulationNumber = simulationNumber.match(/\d+/)?.[0]?.padStart(2, '0') ?? formattedVolume;

  const providerLabel = provider === 'osd' ? 'ÖSD' : provider === 'goethe' ? 'Goethe' : 'telc';
  const exerciseLabel = provider === 'telc' ? 'ÜBUNGSTEST' : 'MODELLSATZ';

  // Photo resolution: custom prop takes precedence, otherwise rotate based on volume index
  const photoList = provider === 'osd' ? osdPhotos : goetheTelcPhotos;
  const photoUrl = coverImageUrl || photoList[volumeIndex % photoList.length];

  const stampAccent = theme.stampAccents[volumeIndex % theme.stampAccents.length];

  return (
    <div
      className={`group relative flex h-52 w-full select-none items-center justify-center overflow-visible rounded-2xl p-3 transition-all duration-300 group-hover:scale-[1.02] ${
        stageClassName ?? 'bg-slate-100/70'
      } ${className ?? ''}`}
    >
      {/* Soft Ambient Glow */}
      <div className={`pointer-events-none absolute inset-8 rounded-full blur-2xl ${theme.glow}`} />

      {/* 3D Book Container: w-36 h-48 with ivory paper edge and soft realistic shadow */}
      <div
        className="relative z-10 flex h-48 w-36 -rotate-[1.5deg] flex-col justify-between overflow-hidden rounded-r-xl rounded-l-[4px] border-r-[3px] border-b-[3px] border-[#f1f5f9] bg-[#fffdf9] p-2 pl-3.5 shadow-[0_12px_24px_-6px_rgba(15,23,42,0.16),-4px_0_6px_rgba(0,0,0,0.06),6px_8px_16px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:rotate-0 group-hover:-translate-y-1"
      >
        {/* 3D Spine on Left (w-3) */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 top-0 w-3 bg-gradient-to-b ${theme.spineGradient} shadow-inner`}
        >
          <div className="h-full w-full bg-gradient-to-r from-black/25 via-white/20 to-black/15" />
        </div>

        {/* Top Tier (44% Height — Academic Identity Zone) */}
        <div
          className={`relative z-10 flex h-[44%] shrink-0 flex-col justify-between rounded-t-md bg-gradient-to-b ${theme.pastelWash} pr-0.5 pt-0.5 pb-1`}
        >
          {/* Header Row: Provider Badge + PRÜFUNGSTRAINING */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
              <span className="text-[6px] font-extrabold tracking-[0.14em] text-slate-500">PRÜFUNGSTRAINING</span>
            </div>
            <span
              className="rounded-full border px-1.5 py-0.2 text-[6.5px] font-black tracking-wider uppercase shadow-xs"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                borderColor: `${theme.accentColor}33`,
              }}
            >
              {providerLabel}
            </span>
          </div>

          {/* Core Row: Large Level (B1 / B2) + Volume Pill Badge (TẬP 01..04) */}
          <div className="mt-0.5 flex items-baseline justify-between gap-1">
            <div className="text-3xl font-black leading-none tracking-tight" style={{ color: theme.levelColor }}>
              {level}
            </div>
            <span className="whitespace-nowrap rounded-md border border-slate-200/70 bg-slate-100/90 px-1.5 py-0.5 text-[7px] font-bold text-slate-700 shadow-xs">
              TẬP {formattedVolume}
            </span>
          </div>

          {/* Footer of Top Tier: Skills Indicator */}
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-0.5 text-[6.5px] font-bold tracking-wider text-slate-500">
            <span>LESEN · HÖREN</span>
            <span className="text-[6px] font-semibold text-slate-400">{exerciseLabel}</span>
          </div>
        </div>

        {/* Bottom Tier (56% Height — Real Photo Window) */}
        <div className="relative z-10 h-[56%] w-full overflow-hidden rounded-lg border border-slate-200/70 shadow-xs">
          {!imgError ? (
            <img
              src={photoUrl}
              alt={title}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${theme.fallbackGradient}`} />
          )}

          {/* Subtle Bottom Vignette Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent" />

          {/* Bottom Tier Content: Stamp + CEFR Level Gauge */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-1.5">
            {/* Test Stamp Badge */}
            <div className="mb-1 flex items-center justify-between">
              <span
                className="rounded px-1.5 py-0.5 text-[6.5px] font-black tracking-wider text-slate-950 shadow-sm"
                style={{ backgroundColor: stampAccent }}
              >
                {exerciseLabel} {formattedSimulationNumber}
              </span>
              <span
                className="text-xl font-black leading-none tracking-tighter text-white/95 drop-shadow-sm"
                aria-hidden="true"
              >
                {formattedSimulationNumber}
              </span>
            </div>

            {/* 6-Slot CEFR Gauge: [A1][A2][B1][B2][C1][C2] */}
            <div className="flex items-center gap-0.5">
              {cefrLevels.map((item) => {
                const isActive = item === level;
                return (
                  <span
                    key={item}
                    className={`flex-1 rounded-[2px] py-0.5 text-center text-[5.5px] font-bold transition-colors ${
                      isActive ? 'font-black text-slate-950 shadow-xs' : 'bg-black/35 text-white/70 backdrop-blur-xs'
                    }`}
                    style={isActive ? { backgroundColor: stampAccent } : undefined}
                  >
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
