'use client';

import { Search, RotateCcw } from 'lucide-react';
import type { LearningSkill } from '../../data/deep-learning-fixtures';
import type { SkillFilters } from '../../lib/skill-catalog';

type FilterGroup = 'level' | 'provider' | 'teil';

type SkillFilterSidebarProps = {
  skill: LearningSkill;
  filters: SkillFilters;
  onQueryChange: (query: string) => void;
  onToggle: (group: FilterGroup, value: string) => void;
  onReset: () => void;
};

type ChoiceItem = { value: string; label: string; note?: string };

const staticChoices: Record<'level' | 'provider', readonly ChoiceItem[]> = {
  level: [{ value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'A1', label: 'A1', note: 'Sắp ra mắt' }, { value: 'A2', label: 'A2', note: 'Sắp ra mắt' }],
  provider: [{ value: 'ÖSD', label: 'ÖSD Zertifikat' }, { value: 'Goethe', label: 'Goethe-Zertifikat', note: 'Sắp ra mắt' }, { value: 'TELC', label: 'telc Deutsch', note: 'Sắp ra mắt' }],
};

function CheckboxGroup({ title, group, items, selected, onToggle }: { title: string; group: FilterGroup; items: readonly ChoiceItem[]; selected: string[]; onToggle: (group: FilterGroup, value: string) => void }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">{title}</legend>
      <div className="grid gap-2">
        {items.map((choice) => {
          const isDisabled = Boolean(choice.note);
          return <label className={`flex items-center gap-2 text-sm ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`} key={choice.value}>
            <input type="checkbox" checked={selected.includes(choice.value)} disabled={isDisabled} onChange={() => onToggle(group, choice.value)} className="h-4 w-4 rounded border-slate-300 accent-[#da2527]" />
            <span>{choice.label}</span>
            {choice.note && <span className="text-[10px] text-slate-400">{choice.note}</span>}
          </label>;
        })}
      </div>
    </fieldset>
  );
}

export function SkillFilterSidebar({ skill, filters, onQueryChange, onToggle, onReset }: SkillFilterSidebarProps) {
  const hasFilters = Boolean(filters.query || filters.levels.length || filters.providers.length || filters.teils.length);
  const teilItems: ChoiceItem[] = (skill === 'Lesen' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((value) => ({ value: `Teil ${value}`, label: `Teil ${value}` }));
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
      <label className="relative block">
        <span className="sr-only">Tìm kiếm bài luyện {skill === 'Lesen' ? 'đọc' : 'nghe'}</span>
        <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={filters.query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm tên bài, chủ đề hoặc mã đề" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-[#da2527]" />
      </label>
      <div className="mt-4 space-y-6 rounded-2xl border border-slate-200 bg-white p-5">
        <CheckboxGroup title="Trình độ CEFR" group="level" items={staticChoices.level} selected={filters.levels} onToggle={onToggle} />
        <CheckboxGroup title="Chuẩn khảo thí" group="provider" items={staticChoices.provider} selected={filters.providers} onToggle={onToggle} />
        <CheckboxGroup title="Dạng phần thi (Teil)" group="teil" items={teilItems} selected={filters.teils} onToggle={onToggle} />
        {hasFilters && <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] hover:underline"><RotateCcw size={13} aria-hidden="true" /> Đặt lại bộ lọc</button>}
      </div>
    </aside>
  );
}
