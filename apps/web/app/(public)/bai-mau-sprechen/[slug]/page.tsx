import { notFound, redirect } from 'next/navigation';
import { SpeakingDialogViewer } from '../../../../components/model-answers/speaking/SpeakingDialogViewer';
import { SpeakingFeedbackViewer } from '../../../../components/model-answers/speaking/SpeakingFeedbackViewer';
import { SpeakingPracticeWorkspace } from '../../../../components/model-answers/speaking/SpeakingPracticeWorkspace';
import { SpeakingSlidesViewer } from '../../../../components/model-answers/speaking/SpeakingSlidesViewer';
import { RedemittelGrid } from '../../../../components/model-answers/speaking/RedemittelGrid';
import { TeacherSpeakingCta } from '../../../../components/model-answers/speaking/TeacherSpeakingCta';
import { speakingProviderLabels, speakingTaskTypeLabels, speakingTasks } from '../../../../data/speaking-fixtures';

export default async function SprechenDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const legacy = /^(goethe|osd)(?:-zdo)?-(b1|b2)(?:-.*)?$/i.exec(slug);
  if (legacy && !speakingTasks.some((candidate) => candidate.slug === slug)) redirect(`/bai-mau/${legacy[1].toLowerCase()}#sprechen-${legacy[2].toLowerCase()}`);
  const task = speakingTasks.find((candidate) => candidate.slug === slug);
  if (!task) notFound();
  const providerTasks = speakingTasks.filter((candidate) => candidate.examProvider === task.examProvider);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px] gap-8 items-start">
        <aside className="sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#da2527] mb-2">Sprechen Hub</div>
            <h2 className="font-bold text-slate-900 text-lg mb-1">{task.title}</h2>
            <p className="text-xs text-slate-500 mb-4">{task.topic}</p>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-600">Thời lượng: ~{Math.ceil(task.durationSeconds / 60)} phút</span>
              <span className="text-xs font-semibold text-slate-600">Định dạng: {speakingTaskTypeLabels[task.taskType]}</span>
              <span className="text-xs font-semibold text-slate-600">Kỳ thi: {speakingProviderLabels[task.examProvider]}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Các phần trong bài</div>
            <nav className="flex flex-col gap-2" aria-label="Các phần Sprechen">
              {providerTasks.map((candidate) => (
                <a className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${candidate.slug === task.slug ? 'bg-red-50 border-red-200 text-[#da2527]' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`} href={`/bai-mau-sprechen/${candidate.slug}`} key={candidate.slug}>
                  Teil {candidate.part} · {candidate.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="space-y-6 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#da2527] bg-red-50 px-2.5 py-1 rounded-md">B1 · Sprechen</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{speakingProviderLabels[task.examProvider]}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{task.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Luyện nói theo dạng đề {speakingProviderLabels[task.examProvider]} với bài mẫu song ngữ và mẫu câu có thể tái sử dụng.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#da2527] bg-red-50 px-2.5 py-1 rounded-md">Aufgabenstellung · Teil {task.part}</span>
              <span className="text-xs font-medium text-slate-400">CEFR B1</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2" lang="de">{task.instructionDe}</h3>
            <p className="text-sm text-slate-600 mb-4">{task.instructionVi}</p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {task.bulletPoints.map((point, index) => (
                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200" key={`${point}-${index}`}>{point}</span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {task.taskType === 'PRESENTATION_SLIDES' && <SpeakingSlidesViewer task={task} />}
            {task.taskType === 'PLAN_DIALOG' && <SpeakingDialogViewer task={task} />}
            {task.taskType === 'FEEDBACK_QA' && <SpeakingFeedbackViewer task={task} />}
          </div>
        </main>

        <aside className="sticky top-24 space-y-6">
          <SpeakingPracticeWorkspace task={task} />
          <RedemittelGrid redemittel={task.redemittel} />
          <TeacherSpeakingCta />
        </aside>
      </div>
    </div>
  );
}
