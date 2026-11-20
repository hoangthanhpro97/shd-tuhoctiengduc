import { BookOpenCheck, Check, Clock3, ExternalLink, Headphones, Lightbulb, Play } from 'lucide-react';
import Link from 'next/link';
import type { ExamStudyPayload, StudySection } from '../../lib/server/exam-answer-key-loader';
import { examBookSets } from '../../data/exam-book-sets';
import { ExamBookCover } from './ExamBookCover';
import { StartExamButton } from './StartExamButton';

function formatTimestamp(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

function Stimulus({ section }: { section: StudySection }) {
  const stimulus = section.stimulus;

  if (!stimulus) {
    return <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-500">Ngữ liệu của phần thi đang được cập nhật.</p>;
  }

  if (stimulus.type === 'text') {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#0284c7]" aria-hidden="true"><BookOpenCheck size={18} /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0284c7]">Lesen · Ngữ liệu</p>
            <h3 className="mt-1 text-base font-extrabold leading-snug text-slate-900">{stimulus.title ?? section.title}</h3>
          </div>
        </div>
        <p className="mt-5 whitespace-pre-line text-sm leading-[1.9] text-slate-700">{stimulus.content}</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-[#da2527]" aria-hidden="true"><Headphones size={18} /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#da2527]">Hören · Audio &amp; Transcript</p>
          <h3 className="mt-1 text-base font-extrabold leading-snug text-slate-900">{stimulus.title ?? section.title}</h3>
        </div>
      </div>
      {stimulus.audioUrl ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <audio className="w-full" controls preload="metadata" src={stimulus.audioUrl}>
            <track kind="captions" />
          </audio>
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">Audio mẫu chưa có tệp phát trực tiếp. Bạn có thể học theo transcript bên dưới.</p>
      )}
      {stimulus.dialogueTranscript ? (
        <div className="mt-5 space-y-3" aria-label="Transcript">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Transcript</p>
          {stimulus.dialogueTranscript.map((turn) => (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5" key={`${turn.speakerId}-${turn.timestampStart}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-xs font-extrabold text-[#da2527]">{turn.speakerName}</strong>
                <span className="text-[10px] font-bold tabular-nums text-slate-400">{formatTimestamp(turn.timestampStart)}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{turn.textDe}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{turn.textVi}</p>
            </div>
          ))}
        </div>
      ) : stimulus.content && !stimulus.audioUrl ? (
        <p className="mt-5 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{stimulus.content}</p>
      ) : null}
    </article>
  );
}

function QuestionCard({ question }: { question: StudySection['questions'][number] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-extrabold leading-relaxed text-slate-900 sm:text-[15px]">Câu {question.order}. {question.prompt}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-extrabold text-emerald-700"><Check size={13} aria-hidden="true" /> Đáp án: {question.correctAnswer}</span>
      </div>
      {question.options.length > 0 ? (
        <div className="mt-4 grid gap-2" aria-label={`Các phương án câu ${question.order}`}>
          {question.options.map((option) => {
            const isCorrect = option.text === question.correctAnswer;
            return (
              <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${isCorrect ? 'border-emerald-200 bg-emerald-50/80 font-bold text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-700'}`} key={option.id}>
                <span className={`mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>{option.id}</span>
                <span>{option.text}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600">Câu trả lời: <strong className="text-emerald-700">{question.correctAnswer}</strong></p>
      )}
    </article>
  );
}

function SectionBlock({ payload, section, index }: { payload: ExamStudyPayload; section: StudySection; index: number }) {
  const explanationHref = `/de-thi/${payload.canonicalSlug}/giai-thich?skill=${payload.skill}`;

  return (
    <section className="scroll-mt-24" id={`teil-${index + 1}`} aria-labelledby={`teil-${index + 1}-title`}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0284c7]">Teil {index + 1} · {section.skill === 'Lesen' ? 'Lesen' : 'Hören'}</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-slate-900" id={`teil-${index + 1}-title`}>{section.title}</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500"><Clock3 size={13} /> {section.durationMinutes} phút · {section.questions.length} câu</span>
        </div>
        <div className="mt-5"><Stimulus section={section} /></div>
      </div>
      <div className="mt-4 space-y-3">
        {section.questions.map((question) => <QuestionCard key={question.id} question={question} />)}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        <StartExamButton slug={payload.canonicalSlug} mode="exam" sectionFilter={payload.skill} label={<><Play size={13} fill="currentColor" /> Làm phần này</>} buttonClassName="rounded-lg px-4 py-2.5 text-xs" />
        <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-colors hover:border-[#da2527] hover:bg-rose-50 hover:text-[#da2527]" href={explanationHref}><Lightbulb size={14} /> Giải thích chi tiết</Link>
      </div>
    </section>
  );
}

function RelatedBookCard({ bookSet }: { bookSet: (typeof examBookSets)[number] }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md">
      <Link className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100" href={`/de-thi/${bookSet.slug}`} aria-label={`Mở ${bookSet.title}`}>
        <div className="origin-top-left scale-[0.59]">
          <ExamBookCover className="h-52 w-36 rounded-xl" level={bookSet.level} provider="osd" simulationNumber={bookSet.volumeNumber} stageClassName={bookSet.level === 'B1' ? 'bg-sky-100/80' : 'bg-rose-100/75'} title={bookSet.title} />
        </div>
      </Link>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900">{bookSet.title}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{bookSet.description}</p>
        <Link className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[#da2527] hover:text-[#b81e20]" href={`/de-thi/${bookSet.slug}`}>Xem bộ đề <ExternalLink size={12} /></Link>
      </div>
    </article>
  );
}

export function ExamFullKeyView({ payload }: { payload: ExamStudyPayload }) {
  const skillLabel = payload.skill === 'lesen' ? 'Lesen' : 'Hören';
  const coverLevel = payload.level === 'C1' ? 'B2' : payload.level;
  const num = (payload.canonicalSlug.match(/(\d+)$/)?.[1] ?? '01').padStart(2, '0');
  const title = `ÖSD Zertifikat ${payload.level} · Modelltest ${num}`;

  return (
    <main className="min-h-screen overflow-x-clip bg-gradient-to-b from-[#fff1f1]/75 via-white to-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <Link className="hover:text-[#da2527]" href="/">Trang chủ</Link>
          <span aria-hidden="true">&gt;</span>
          <Link className="hover:text-[#da2527]" href="/de-thi">Đề thi online</Link>
          <span aria-hidden="true">&gt;</span>
          <Link className="hover:text-[#da2527]" href={`/de-thi/${payload.canonicalSlug}`}>{title}</Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-bold text-slate-900" aria-current="page">Đề và đáp án</span>
        </nav>

        <header className="mx-auto max-w-3xl pt-8 text-center sm:pt-10">
          <div className="mx-auto w-52 rounded-[2rem] bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 p-3 shadow-sm sm:w-60">
            <ExamBookCover className="h-60 rounded-[1.5rem] p-4" stageClassName="bg-white/55" level={coverLevel} provider="osd" simulationNumber={num} title={title} />
          </div>
          <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0284c7]">SHD Kontext-Methode · {skillLabel}</p>
           <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">{title} — Đề thi và đáp án {skillLabel}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">Xem trọn ngữ liệu, toàn bộ câu hỏi và đáp án được đối chiếu theo từng Teil. Luyện riêng {skillLabel} hoặc bắt đầu một phiên thi thử ngay.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Chọn kỹ năng">
            <Link className={`rounded-full px-4 py-2 text-xs font-extrabold transition-colors ${payload.skill === 'lesen' ? 'bg-[#da2527] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#da2527] hover:text-[#da2527]'}`} href={`/de-thi/${payload.canonicalSlug}/de-va-dap-an?skill=lesen`}>Lesen</Link>
            <Link className={`rounded-full px-4 py-2 text-xs font-extrabold transition-colors ${payload.skill === 'hoeren' ? 'bg-[#da2527] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#da2527] hover:text-[#da2527]'}`} href={`/de-thi/${payload.canonicalSlug}/de-va-dap-an?skill=hoeren`}>Hören</Link>
          </div>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:w-56" aria-label="Mục lục bài thi">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Mục lục · {skillLabel}</p>
              <nav className="mt-3 space-y-1" aria-label="Các phần thi">
                {payload.sections.map((section, index) => <a className="block rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-rose-50 hover:text-[#da2527]" href={`#teil-${index + 1}`} key={section.sectionId}>Teil {index + 1}<span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">{section.title}</span></a>)}
              </nav>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <StartExamButton slug={payload.canonicalSlug} mode="exam" sectionFilter={payload.skill} label={<><Play size={14} fill="currentColor" /> Làm bài ngay</>} buttonClassName="w-full rounded-xl py-3 text-xs" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-8">
            {payload.sections.map((section, index) => <SectionBlock key={section.sectionId} payload={payload} section={section} index={index} />)}
          </div>
        </div>
      </div>

      <section className="mx-auto mt-14 max-w-6xl px-4" aria-labelledby="free-registration-title">
        <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-100 via-[#fff4ed] to-rose-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#da2527]">Học cùng SHD</p>
            <h2 className="mt-2 text-xl font-black text-slate-900" id="free-registration-title">Đăng ký miễn phí để lưu tiến độ</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Lưu phiên làm bài, xem lại kết quả và tiếp tục luyện Lesen &amp; Hören trên mọi thiết bị.</p>
          </div>
          <Link className="mt-5 inline-flex shrink-0 items-center justify-center rounded-xl bg-[#da2527] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#b81e20] sm:mt-0" href="/tai-khoan">Đăng ký miễn phí <span className="ml-2" aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4" aria-labelledby="related-books-title">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0284c7]">ÖSD Online-Test</p>
            <h2 className="mt-1 text-xl font-black text-slate-900" id="related-books-title">Bộ đề liên quan</h2>
          </div>
          <Link className="inline-flex items-center gap-1 text-xs font-extrabold text-[#da2527]" href="/de-thi">Xem tất cả <ExternalLink size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{examBookSets.map((bookSet) => <RelatedBookCard bookSet={bookSet} key={bookSet.slug} />)}</div>
      </section>
    </main>
  );
}
