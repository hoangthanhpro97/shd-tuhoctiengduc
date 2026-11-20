'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Headphones, Lightbulb } from 'lucide-react';
import type { GuideQuestion } from '../ReadingGuidePanel';

interface ListeningStep {
  number: number;
  title: string;
  subtitle: string;
  detail: string;
  tip: string;
}

const TEIL_STRATEGIES: Record<number, { label: string; badge: string; steps: ListeningStep[]; coreTip: string }> = {
  1: {
    label: 'Nghe hiểu · Teil 1 (5 thông báo ngắn)',
    badge: '2× hören · Richtig/Falsch & A/B/C',
    steps: [
      {
        number: 1,
        title: 'Đọc lướt cặp câu hỏi của từng Text',
        subtitle: 'Xác định từ khóa & bối cảnh trước khi phát',
        detail:
          'Mỗi đoạn thông báo ngắn (Text 1–5) tương ứng với 2 câu hỏi liền kề: câu lẻ (Richtig/Falsch) kiểm tra thông tin tổng quát, câu chẵn (A/B/C) hỏi chi tiết cụ thể (giờ giấc, sân ga, hành động cần làm).',
        tip: 'Gạch chân các từ mang ý phủ định hoặc giới hạn như "planmäßig", "nur", "bereits", "nicht mehr".',
      },
      {
        number: 2,
        title: 'Lần nghe 1: Bắt từ khóa & chốt đáp án sơ bộ',
        subtitle: 'Tập trung vào các thông báo thay đổi đột xuất',
        detail:
          'Trong thông báo tàu xe / bảo tàng / điện thoại, thông tin quan trọng thường xuất hiện ngay sau các từ chuyển ý như "Achtung", "Leider", "Bitte beachten Sie", "Stattdessen".',
        tip: 'Đừng dừng lại quá lâu ở 1 câu bỏ lỡ; chuyển ngay sang Text tiếp theo để không mất nhịp.',
      },
      {
        number: 3,
        title: 'Lần nghe 2: Kiểm chứng & bẫy diễn đạt lại',
        subtitle: 'Đối chiếu câu đúng/sai với cách nói đồng nghĩa',
        detail:
          'Đề ÖSD rất hay dùng từ đồng nghĩa (ví dụ: "Verspätung" thay vì "nicht planmäßig", "kostenlos" thay vì "ermäßigt"). Dùng lượt nghe thứ 2 để xác nhận chắc chắn 100%.',
        tip: 'Nếu cả 3 phương án A/B/C đều được nhắc tới trong audio, hãy chú ý xem phương án nào bị phủ định.',
      },
    ],
    coreTip: 'Chiến lược Teil 1: Luôn đọc trước cả 2 câu hỏi của cùng 1 Text trước khi audio bắt đầu đọc đoạn đó.',
  },
  2: {
    label: 'Nghe hiểu · Teil 2 (Thuyết minh / Hướng dẫn)',
    badge: '2× hören · Multiple Choice A/B/C',
    steps: [
      {
        number: 1,
        title: 'Nắm bố cục bài thuyết minh theo trình tự',
        subtitle: 'Câu hỏi đi theo đúng thứ tự thời gian audio',
        detail:
          'Các câu Aufgaben 11–15 xuất hiện tuần tự từ đầu đến cuối bài hướng dẫn (thời lượng, quy định tham quan, khuôn viên, lịch mở cửa...).',
        tip: 'Đọc nhanh phần gốc câu hỏi để biết mình đang chờ nghe mốc thông tin nào tiếp theo.',
      },
      {
        number: 2,
        title: 'Bắt tín hiệu chuyển đoạn của người dẫn',
        subtitle: 'Nhận diện các mốc số liệu & quy định',
        detail:
          'Chú ý các con số (30 Minuten / 50 Minuten / 2 Stunden), từ chỉ điều kiện ("nur ohne Blitzlicht", "kostenfrei") và ngoại lệ ("außer", "allerdings").',
        tip: 'Ghi nhanh vào cột Ghi chú nếu có 2 con số gần nhau dễ gây nhiễu.',
      },
      {
        number: 3,
        title: 'Lần nghe 2: Rà soát các câu phân vân',
        subtitle: 'Loại trừ phương án gây nhiễu (Distraktor)',
        detail:
          'Phương án sai thường dùng đúng từ khóa xuất hiện trong audio nhưng gán cho đối tượng hoặc khung giờ khác.',
        tip: 'Đọc kỹ chủ ngữ của câu hỏi (ví dụ: Prunksäle khác với Schlosspark).',
      },
    ],
    coreTip: 'Chiến lược Teil 2: Các câu hỏi tuân theo trình tự tuyến tính — luôn dõi theo câu kế tiếp để không bị lạc đoạn.',
  },
  3: {
    label: 'Nghe hiểu · Teil 3 (Hội thoại đời sống)',
    badge: '1× hören · CHỈ NGHE 1 LẦN DUY NHẤT',
    steps: [
      {
        number: 1,
        title: 'Chuẩn bị kỹ tối đa trước khi bấm Phát',
        subtitle: 'Teil 3 chỉ được nghe duy nhất 1 lượt!',
        detail:
          'Vì không có lượt nghe thứ 2, hãy dành 30–45 giây đọc trọn vẹn cả 7 câu Richtig/Falsch (Aufgaben 16–22), xác định rõ ai nói gì (Katja hay Florian) và động từ chính.',
        tip: 'Đặc biệt để ý các từ tuyệt đối như "unbedingt", "gemeinsam", "heute Abend".',
      },
      {
        number: 2,
        title: 'Theo sát diễn biến đồng ý hay phản đối',
        subtitle: 'Cẩn thận bẫy đề xuất rồi đổi ý trong hội thoại',
        detail:
          'Trong hội thoại tự nhiên, một người đưa ra gợi ý ("Wie wäre es mit..."), người kia có thể từ chối ("Das ist mir zu teuer") rồi cả hai mới chốt phương án cuối cùng.',
        tip: 'Đợi nghe hết câu phản hồi của người thứ hai trước khi chọn Richtig hoặc Falsch.',
      },
      {
        number: 3,
        title: 'Chốt dứt khoát ngay khi hội thoại kết thúc',
        subtitle: 'Không để trống bất kỳ câu nào',
        detail:
          'Ngay khi băng vừa dừng, ký ức ngắn hạn vẫn còn rất rõ — rà soát nhanh 7 câu và chốt đáp án trước khi chuyển sang Teil 4.',
        tip: 'Nếu bỏ lỡ 1 câu, đánh dấu tạm theo mạch logic chung rồi tập trung cho câu sau.',
      },
    ],
    coreTip: 'Cảnh báo Teil 3: Chỉ được phát 1 lần duy nhất! Tuyệt đối đọc kỹ toàn bộ 7 câu hỏi trước khi bấm nút Phát.',
  },
  4: {
    label: 'Nghe hiểu · Teil 4 (Thảo luận Radio)',
    badge: '2× hören · Zuordnung (Nối người nói)',
    steps: [
      {
        number: 1,
        title: 'Nhận diện giọng nói & vai trò 3 nhân vật',
        subtitle: 'Phân biệt Moderator, Khách mời 1 và Khách mời 2',
        detail:
          'Ngay phút mở đầu, Moderator sẽ giới thiệu tên và nghề nghiệp của từng khách mời (ví dụ: Frau Dr. Berg — chuyên gia môi trường; Herr Gruber — chủ cửa hàng Unverpackt). Hãy ghi nhớ chất giọng nam/nữ và lập trường của mỗi người.',
        tip: 'Lập trường nghề nghiệp giúp bạn thu hẹp 50% khả năng đáp án ngay từ khi đọc đề.',
      },
      {
        number: 2,
        title: 'Nghe lần 1: Bắt quan điểm nổi bật theo lượt nói',
        subtitle: 'Chú ý cách mở đầu quan điểm cá nhân',
        detail:
          'Các mẫu câu báo hiệu quan điểm: "Meiner Meinung nach...", "Ich finde es wichtig, dass...", "Aus meiner Erfahrung...", "Das sehe ich anders...".',
        tip: 'Người dẫn chương trình (Moderator) thường đặt câu hỏi, tóm tắt hoặc nêu số liệu dẫn dắt.',
      },
      {
        number: 3,
        title: 'Nghe lần 2: Khóa chặt các câu còn trống',
        subtitle: 'Kiểm tra kỹ người đồng tình vs người phản biện',
        detail:
          'Đôi khi khách mời B nhắc lại ý của khách mời A để phản bác — hãy xác định xem ai thực sự là người ủng hộ nhận định nêu trong câu hỏi.',
        tip: 'Sử dụng 3 nút chọn ngang (A / B / C) để thao tác nhanh ngay trong lúc nghe.',
      },
    ],
    coreTip: 'Chiến lược Teil 4: Phân biệt chất giọng và vai trò nghề nghiệp của 3 nhân vật trong 30 giây đầu tiên.',
  },
};

export function ListeningGuideContent({
  part,
  questions,
  currentQuestionId,
  onSelectQuestion,
}: {
  part: number;
  questions: GuideQuestion[];
  currentQuestionId?: string;
  onSelectQuestion?: (id: string) => void;
}) {
  const strategy = TEIL_STRATEGIES[part] ?? TEIL_STRATEGIES[1];
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleToggleStep = (stepNumber: number) => {
    if (activeStep !== stepNumber) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep));
      setActiveStep(stepNumber);
    }
  };

  const activeQuestion =
    questions.find((q) => q.id === currentQuestionId) ?? questions[0];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      {/* Header info */}
      <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <Headphones size={13} className="text-[#da2527]" />
            {strategy.label}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
              part === 3
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-50 text-[#da2527]'
            }`}
          >
            {strategy.badge}
          </span>
          {activeQuestion && (
            <span className="text-[11px] font-bold text-slate-500">
              Câu {activeQuestion.order}
            </span>
          )}
        </div>
      </div>

      {/* Quick question selector pills */}
      {questions.length > 0 && onSelectQuestion && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {questions.map((q) => {
            const isActive = q.id === activeQuestion?.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestion(q.id)}
                className={`flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-[#da2527] bg-red-50 text-[#da2527]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {q.order}
              </button>
            );
          })}
        </div>
      )}

      {/* Vertical Stepper Accordion */}
      <div className="space-y-2.5">
        {strategy.steps.map((step) => {
          const isExpanded = activeStep === step.number;
          const isCompleted = completedSteps.has(step.number) && !isExpanded;

          return (
            <div
              key={step.number}
              className={`overflow-hidden rounded-xl border transition-all ${
                isExpanded
                  ? 'border-blue-200 bg-white shadow-xs'
                  : 'border-slate-200/80 bg-white/80 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleStep(step.number)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isExpanded
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check size={13} strokeWidth={3} /> : step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">{step.title}</div>
                  <div className="truncate text-[11px] text-slate-500">{step.subtitle}</div>
                </div>
                {isExpanded ? (
                  <ChevronUp size={15} className="shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown size={15} className="shrink-0 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 px-3.5 pb-3.5 pt-2.5 text-xs leading-relaxed text-slate-600">
                  <p className="m-0">{step.detail}</p>
                  <div className="mt-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-2.5 text-[11px] text-emerald-900">
                    <strong className="mb-0.5 block font-bold uppercase tracking-wide text-emerald-700">
                      Mẹo xử lý nhanh
                    </strong>
                    {step.tip}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom core strategy callout */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-[11px] leading-relaxed text-amber-900">
        <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <span>{strategy.coreTip}</span>
      </div>
    </div>
  );
}
