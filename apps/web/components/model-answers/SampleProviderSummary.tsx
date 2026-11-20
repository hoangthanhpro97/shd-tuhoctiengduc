import Link from 'next/link';
import { ArrowRight, Mic2, PenLine } from 'lucide-react';
import { speakingProviderLabels, speakingTasks } from '../../data/speaking-fixtures';
import { writingProviderLabels, writingTasks } from '../../data/writing-fixtures';

type Provider = 'goethe' | 'osd' | 'telc';
type SectionKey = 'schreiben-b1' | 'schreiben-b2' | 'sprechen-b1' | 'sprechen-b2';

const sectionLabels: Record<SectionKey, string> = {
  'schreiben-b1': 'Bài mẫu Schreiben B1',
  'schreiben-b2': 'Bài mẫu Schreiben B2',
  'sprechen-b1': 'Bài mẫu Sprechen B1',
  'sprechen-b2': 'Bài mẫu Sprechen B2',
};

const providerLabels: Record<Provider, string> = { goethe: 'Goethe', osd: 'ÖSD', telc: 'TELC' };

function sampleProviderMatches(provider: Provider, taskProvider: string) {
  return provider === 'goethe' ? taskProvider.startsWith('goethe') : provider === 'osd' ? taskProvider.startsWith('osd') : taskProvider.startsWith('telc');
}

function EmptySample({ provider, section }: { provider: Provider; section: SectionKey }) {
  return <div className="provider-empty-state"><strong>{providerLabels[provider]} · {sectionLabels[section]}</strong><p className="mt-2">Bài mẫu đang được biên tập và sẽ sớm được cập nhật.</p></div>;
}

export function SampleProviderSummary({ provider }: { provider: Provider }) {
  const sections: SectionKey[] = ['schreiben-b1', 'schreiben-b2', 'sprechen-b1', 'sprechen-b2'];
  return <main className="provider-summary-page"><div className="container"><header className="provider-summary-hero"><p className="eyebrow">Bài mẫu · {providerLabels[provider]}</p><h1>{providerLabels[provider]} · Schreiben &amp; Sprechen</h1><p>Tham khảo cách triển khai bài mẫu song ngữ, dàn ý và Redemittel theo từng kỹ năng và cấp độ.</p><nav className="provider-summary-nav" aria-label="Khu vực bài mẫu">{sections.map((section) => <a href={`#${section}`} key={section}>{sectionLabels[section]} <ArrowRight size={14} /></a>)}</nav></header><div className="provider-summary-sections">{sections.map((section) => { const isWriting = section.startsWith('schreiben'); const level = section.endsWith('b1') ? 'B1' : 'B2'; const writingItems = writingTasks.filter((task) => task.level === level && sampleProviderMatches(provider, task.examProvider)); const speakingItems = speakingTasks.filter((task) => task.level === level && sampleProviderMatches(provider, task.examProvider)); const itemCount = isWriting ? writingItems.length : speakingItems.length; return <section className="provider-summary-section scroll-mt-24" id={section} key={section}><div className="provider-summary-section-heading"><div><p className="eyebrow">{providerLabels[provider]} · {level}</p><h2>{sectionLabels[section]}</h2></div><span>{itemCount ? `${itemCount} bài` : 'Đang cập nhật'}</span></div>{itemCount ? <div className="provider-sample-grid">{isWriting ? writingItems.map((task) => <Link className="provider-sample-card" href={`/bai-mau-schreiben/${task.slug}`} key={task.id}><PenLine size={18} /><span><strong>{task.title}</strong><small>{writingProviderLabels[task.examProvider]} · {task.partLabel}</small></span><ArrowRight size={15} /></Link>) : speakingItems.map((task) => <Link className="provider-sample-card" href={`/bai-mau-sprechen/${task.slug}`} key={task.id}><Mic2 size={18} /><span><strong>{task.title}</strong><small>{speakingProviderLabels[task.examProvider]} · Teil {task.part}</small></span><ArrowRight size={15} /></Link>)}</div> : <EmptySample provider={provider} section={section} />}</section>; })}</div></div></main>;
}
