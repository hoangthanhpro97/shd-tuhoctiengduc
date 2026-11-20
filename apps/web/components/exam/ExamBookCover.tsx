interface ExamBookCoverProps {
  level: 'A1' | 'A2' | 'B1' | 'B2';
  provider: 'goethe' | 'osd' | 'telc';
  simulationNumber: string;
  title: string;
  className?: string;
  stageClassName?: string;
}

type CoverVariant = {
  gradient: string;
  accent: string;
  glow: string;
};

const variants: Record<ExamBookCoverProps['provider'], CoverVariant[]> = {
  osd: [
    { gradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]', accent: '#fbbf24', glow: 'bg-sky-300/35' },
    { gradient: 'from-[#2563eb] via-[#1d4ed8] to-[#1e40af]', accent: '#34d399', glow: 'bg-blue-300/35' },
    { gradient: 'from-[#0891b2] via-[#0e7490] to-[#155e75]', accent: '#fb7185', glow: 'bg-cyan-300/35' },
    { gradient: 'from-[#1d4ed8] via-[#1e3a8a] to-[#172554]', accent: '#f59e0b', glow: 'bg-indigo-300/35' },
  ],
  goethe: [
    { gradient: 'from-[#16a34a] via-[#15803d] to-[#166534]', accent: '#fde047', glow: 'bg-emerald-300/35' },
    { gradient: 'from-[#059669] via-[#047857] to-[#065f46]', accent: '#fdba74', glow: 'bg-green-300/35' },
  ],
  telc: [
    { gradient: 'from-[#334155] via-[#1e293b] to-[#0f172a]', accent: '#facc15', glow: 'bg-slate-300/30' },
    { gradient: 'from-[#b91c1c] via-[#991b1b] to-[#7f1d1d]', accent: '#fef2f2', glow: 'bg-red-300/30' },
  ],
};

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function getVariantIndex(simulationNumber: string, title: string) {
  const number = simulationNumber.match(/\d+/)?.[0] ?? title.match(/(?:-|_|\s)(\d+)\b/)?.[1] ?? '1';
  return Math.max(0, Number.parseInt(number, 10) - 1);
}

function Watermark({ provider }: { provider: ExamBookCoverProps['provider'] }) {
  if (provider === 'goethe') {
    return <svg className="pointer-events-none absolute right-[-1.5rem] top-12 h-36 w-36 text-white opacity-[0.14]" viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="80" r="48" stroke="currentColor" strokeWidth="1.5" /><circle cx="80" cy="80" r="20" stroke="currentColor" strokeWidth="1.5" /><path d="M24 80h112M80 24v112M42 42l76 76M118 42l-76 76" stroke="currentColor" strokeWidth="1.5" /></svg>;
  }
  if (provider === 'telc') {
    return <svg className="pointer-events-none absolute right-[-1rem] top-10 h-40 w-40 text-white opacity-[0.14]" viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="80" r="57" stroke="currentColor" strokeWidth="1.5" /><circle cx="80" cy="80" r="35" stroke="currentColor" strokeWidth="1" /><path d="M23 80h114M80 23v114M40 40l80 80M120 40l-80 80M28 58l104 44M28 102l104-44" stroke="currentColor" strokeWidth="1" /></svg>;
  }
  return <svg className="pointer-events-none absolute right-[-1rem] top-9 h-40 w-40 text-white opacity-[0.14]" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M24 126V72l56-43 56 43v54M42 126V82h76v44M56 126V94h48v32M18 126h124" stroke="currentColor" strokeWidth="2" /><path d="m35 62 45-34 45 34M68 62h24v20H68z" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function ExamBookCover({ level, provider, simulationNumber, title, className, stageClassName }: ExamBookCoverProps) {
  const variant = variants[provider][getVariantIndex(simulationNumber, title) % variants[provider].length];
  const formattedSimulationNumber = simulationNumber.match(/\d+/)?.[0]?.padStart(2, '0') ?? '01';
  const providerLabel = provider === 'osd' ? 'ÖSD' : provider === 'goethe' ? 'GOETHE' : 'TELC';
  const exerciseLabel = provider === 'telc' ? 'ÜBUNGSTEST' : 'MODELLSATZ';

  return (
    <div className={`group relative flex h-52 w-full select-none items-center justify-center overflow-visible rounded-2xl p-3 transition-all duration-300 group-hover:scale-[1.02] ${stageClassName ?? 'bg-slate-100/70'} ${className ?? ''}`}>
      <div className={`pointer-events-none absolute inset-8 rounded-full blur-2xl ${variant.glow}`} />
      <div className={`relative z-10 flex h-44 w-[8.5rem] -rotate-1 flex-col justify-between overflow-hidden rounded-r-md rounded-l-[3px] border-r-[3px] border-b-[3px] border-white/95 p-3 shadow-[0_12px_24px_-6px_rgba(15,23,42,0.28),-4px_0_6px_rgba(0,0,0,0.15),8px_10px_20px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:rotate-0 bg-gradient-to-br ${variant.gradient}`}>
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-3 border-r border-white/20 bg-gradient-to-r from-black/35 via-white/25 to-black/15" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-white/[0.22]" />
        <Watermark provider={provider} />
        <div className="relative z-10 flex items-start justify-between gap-1">
          <span className="text-[6px] font-extrabold tracking-[0.12em] text-white/80">PRÜFUNGSTRAINING</span>
          <span className="rounded bg-white/20 px-1 py-0.5 text-[6px] font-black tracking-widest text-white/95 backdrop-blur-sm">{providerLabel}</span>
        </div>
        <div className="relative z-10 -mt-1">
          <div className="text-4xl font-black leading-none tracking-tight text-white drop-shadow-sm">{level}</div>
          <div className="mt-1 line-clamp-2 max-w-[6.5rem] text-[8px] font-bold uppercase leading-tight text-white/95">{title}</div>
          <div className="mt-2 text-[6px] font-bold tracking-[0.12em] text-white/70">LESEN · HÖREN</div>
        </div>
        <div className="relative z-10 flex items-end justify-between gap-1">
          <span className="rounded px-1.5 py-1 text-[6px] font-black tracking-wider text-slate-950 shadow-sm" style={{ backgroundColor: variant.accent }}>{exerciseLabel} {formattedSimulationNumber}</span>
          <span className="text-3xl font-black leading-none tracking-tighter text-white/95 drop-shadow-sm" aria-hidden="true">{formattedSimulationNumber}</span>
        </div>
        <div className="relative z-10 flex items-center gap-0.5 border-t border-white/25 pt-1">
          {cefrLevels.map((item) => <span className={`flex-1 rounded-sm py-0.5 text-center text-[5px] font-bold ${item === level ? 'text-slate-950 shadow-sm' : 'bg-black/15 text-white/70'}`} style={item === level ? { backgroundColor: variant.accent } : undefined} key={item}>{item}</span>)}
        </div>
      </div>
    </div>
  );
}
