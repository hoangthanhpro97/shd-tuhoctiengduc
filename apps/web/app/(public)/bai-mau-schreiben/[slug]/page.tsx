import { notFound, redirect } from 'next/navigation';
import { WritingModelSample } from '../../../../components/model-answers/writing/WritingModelSample';
import { WritingOutlineViewer } from '../../../../components/model-answers/writing/WritingOutlineViewer';
import { WritingPromptCard } from '../../../../components/model-answers/writing/WritingPromptCard';
import { WritingSidebarRail } from '../../../../components/model-answers/writing/WritingSidebarRail';
import { WritingWorkspace } from '../../../../components/model-answers/writing/WritingWorkspace';
import { writingProviderLabels, writingTaskTypeLabels, writingTasks } from '../../../../data/writing-fixtures';

export default async function SchreibenDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const legacy = /^(goethe|osd)(?:-zdo)?-(b1|b2)(?:-.*)?$/i.exec(slug);
  if (legacy && !writingTasks.some((candidate) => candidate.slug === slug)) redirect(`/bai-mau/${legacy[1].toLowerCase()}#schreiben-${legacy[2].toLowerCase()}`);
  const task = writingTasks.find((candidate) => candidate.slug === slug);
  if (!task) notFound();
  const providerTasks = writingTasks.filter((candidate) => candidate.examProvider === task.examProvider);
  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"><span className="rounded-full bg-red-50 px-3 py-1 text-[#da2527]">B1 - B2 · Schreiben</span><span className="rounded-full bg-slate-100 px-3 py-1">{writingProviderLabels[task.examProvider]}</span><span className="rounded-full bg-emerald-50 px-3 py-1">{writingTaskTypeLabels[task.taskType]}</span></div>
        <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 xl:sticky xl:top-24"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Schreiben Hub</p><h1 className="mt-3 text-xl font-extrabold leading-tight text-slate-900">{task.title}</h1><p className="mt-2 text-xs leading-relaxed text-slate-500">{task.topic}</p><div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600"><span className="block">Thời lượng: {Math.ceil(task.durationSeconds / 60)} phút{task.durationScope === 'MODULE' ? ' (toàn mô-đun)' : ''}</span><span className="block">Định dạng: {writingTaskTypeLabels[task.taskType]}</span><span className="block">Mục tiêu: {task.writingTarget.approximateWords ? `~${task.writingTarget.approximateWords} từ` : 'Theo đề bài'}</span></div></section><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Các phần trong bài</p><nav className="mt-3 space-y-1" aria-label="Các bài Schreiben cùng chuẩn">{providerTasks.map((candidate) => <a className={`block rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${candidate.slug === task.slug ? 'border-red-200 bg-red-50 text-[#da2527]' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`} href={`/bai-mau-schreiben/${candidate.slug}`} key={candidate.slug}>Aufgabe {candidate.part} · {candidate.title}</a>)}</nav></section></aside>
          <section className="min-w-0 space-y-6"><div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{task.title}</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">Luyện viết theo bài mẫu song ngữ, dàn ý rõ ràng và Redemittel có thể tái sử dụng. Hãy tự viết trước khi mở Musterantwort.</p></div><WritingPromptCard task={task} /><WritingOutlineViewer task={task} /><WritingModelSample task={task} /><WritingWorkspace task={task} /></section>
          <WritingSidebarRail task={task} />
        </div>
      </div>
    </main>
  );
}
