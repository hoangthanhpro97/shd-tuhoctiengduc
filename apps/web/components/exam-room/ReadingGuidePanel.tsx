'use client';

import { Check, ChevronDown, ChevronUp, ExternalLink, GripVertical, Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import styles from './ExamRoom.module.css';
import { getGuideForQuestion } from './ReadingGuideData';

export type GuideQuestion = { id: string; order: number };

export type ReadingGuideContentProps = {
  part: number;
  questions: GuideQuestion[];
  currentId: string;
  onSelectQuestion?: (id: string) => void;
};

export function ReadingGuideContent({
  part,
  questions,
  currentId,
  onSelectQuestion,
}: ReadingGuideContentProps) {
  const activeQuestionIndex = Math.max(0, questions.findIndex((q) => q.id === currentId));
  const currentQuestion = questions[activeQuestionIndex] ?? questions[0];
  const currentOrder = currentQuestion?.order ?? 1;

  // Lấy dữ liệu hướng dẫn riêng biệt cho từng câu
  const steps = useMemo(() => getGuideForQuestion(part, currentOrder), [part, currentOrder]);

  // Cho phép đóng mở thẻ tự do (null = đóng tất cả)
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [toolOpen, setToolOpen] = useState(false);

  useEffect(() => {
    setActiveStep(0);
    setCompleted(new Set());
    setToolOpen(false);
  }, [part, currentId]);

  const toggleStep = (index: number) => {
    if (activeStep === index) {
      setActiveStep(null);
    } else {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (activeStep !== null) {
          next.add(activeStep);
        }
        for (let i = 0; i < index; i++) {
          next.add(i);
        }
        return next;
      });
      setActiveStep(index);
    }
  };

  return (
    <div className={styles.readingGuideInner}>
      <div className={styles.readingGuideMeta}>
        <strong>Đọc hiểu · Phần {part}</strong>
        <span>Câu {currentOrder}</span>
      </div>

      {/* Horizontal Tab Navigation: Rút gọn chỉ hiển thị số: 1, 2, 3... */}
      <div className={styles.readingGuideTabs} role="tablist" aria-label="Chọn câu hỏi">
        {questions.map((question) => {
          const isSelected = question.id === currentId;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={isSelected ? styles.readingGuideTabActive : styles.readingGuideTab}
              key={question.id}
              onClick={() => onSelectQuestion?.(question.id)}
            >
              {question.order}
            </button>
          );
        })}
      </div>

      <div className={styles.readingGuideStepper}>
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = completed.has(index) && !isActive;
          return (
            <div className={styles.readingGuideStepRow} key={step.title}>
              <div className={styles.readingGuideStepIndicator}>
                <div
                  className={`${styles.readingGuideNode} ${isActive ? styles.readingGuideNodeActive : ''} ${
                    isCompleted ? styles.readingGuideNodeCompleted : ''
                  }`}
                >
                  {isCompleted ? <Check size={13} strokeWidth={2.5} /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`${styles.readingGuideConnector} ${
                      completed.has(index) ? styles.readingGuideConnectorCompleted : ''
                    }`}
                  />
                )}
              </div>

              <div className={`${styles.readingGuideStepCard} ${isActive ? styles.readingGuideStepCardActive : ''}`}>
                <button
                  type="button"
                  className={styles.readingGuideStepButton}
                  aria-expanded={isActive}
                  onClick={() => toggleStep(index)}
                >
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.summary}</small>
                  </span>
                  {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isActive && (
                  <div className={styles.readingGuideStepBody}>
                    <ul>
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    {step.callout && (
                      <div className={styles.readingGuideCallout}>
                        <strong>{step.callout.label}</strong>
                        <span>{step.callout.text}</span>
                      </div>
                    )}
                    {index === 2 && (
                      <button
                        type="button"
                        className={styles.readingGuideSecondary}
                        onClick={() => setToolOpen(true)}
                      >
                        Mở cấu trúc đọc hiểu / Linearthinking <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toolOpen && (
        <div className={styles.readingGuideTool}>
          <div className={styles.readingGuideToolHeader}>
            <strong>Linearthinking · Đọc hiểu có cấu trúc</strong>
            <button type="button" aria-label="Đóng" onClick={() => setToolOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <p>
            Quy trình tư duy tuyến tính (Linearthinking):
            <br />
            <strong>1. Đọc câu hỏi:</strong> Gạch chân từ khóa chủ đạo và hiểu rõ bản chất điều cần tìm.
            <br />
            <strong>2. Định vị bài đọc:</strong> Quét nhanh để tìm đúng đoạn chứa từ khóa hoặc từ đồng nghĩa (Paraphrase).
            <br />
            <strong>3. Phân tích ngữ cảnh:</strong> Đọc trọn vẹn câu chứa dẫn chứng theo cấu trúc Chủ ngữ - Vị ngữ - Tân ngữ (SV/O).
            <br />
            <strong>4. Đối chiếu logic:</strong> So sánh ý nghĩa thực tế với đáp án để loại trừ phương án bẫy và chốt kết quả.
          </p>
          <div className={styles.readingGuideToolActions}>
            <button type="button" className={styles.readingGuideToolCloseBtn} onClick={() => setToolOpen(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className={styles.readingGuideFooter}>
        <Lightbulb size={15} />
        <span>Chiến lược cốt lõi: Luôn tìm dẫn chứng trong bài đọc trước khi quyết định đáp án, không suy đoán theo cảm tính cá nhân.</span>
      </div>
    </div>
  );
}

export type ReadingGuidePanelProps = {
  part: number;
  questions: GuideQuestion[];
  currentId: string;
  onClose: () => void;
  onSelectQuestion?: (id: string) => void;
};

export function ReadingGuidePanel({
  part,
  questions,
  currentId,
  onClose,
  onSelectQuestion,
}: ReadingGuidePanelProps) {
  // Chức năng thay đổi kích thước cột theo chiều ngang (Resizable)
  const [panelWidth, setPanelWidth] = useState(380);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(380);

  // Xử lý kéo thả thay đổi kích thước cột
  const startResize = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - moveEvent.clientX;
      const minW = 300;
      const maxW = Math.max(minW, Math.min(620, Math.round(window.innerWidth * 0.45)));
      const newWidth = Math.max(minW, Math.min(maxW, startWidth.current + delta));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  return (
    <aside
      className={styles.readingGuidePanel}
      aria-label="Hướng dẫn làm bài"
      style={{ width: `${panelWidth}px`, flex: `0 0 ${panelWidth}px` }}
    >
      {/* Thanh kéo thay đổi kích thước ở mép trái */}
      <div
        className={styles.readingGuideResizer}
        onMouseDown={startResize}
        role="separator"
        aria-label="Kéo để điều chỉnh độ rộng cột hướng dẫn"
      >
        <span className={styles.readingGuideResizerHandle}>
          <GripVertical size={12} />
        </span>
      </div>

      <div className={styles.readingGuideHeader}>
        <span className={styles.readingGuideBadge}>
          <Lightbulb size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
          Hướng dẫn làm bài
        </span>
        <button
          type="button"
          className={styles.readingGuideClose}
          aria-label="Đóng hướng dẫn"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <ReadingGuideContent
        part={part}
        questions={questions}
        currentId={currentId}
        onSelectQuestion={onSelectQuestion}
      />
    </aside>
  );
}
