'use client';

import { Lightbulb, PanelRight, X, Navigation, PenLine, FileText, Eraser, FileSearch, Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FontSizePopover, type FontScope } from './FontSizePopover';
import styles from './ExamRoom.module.css';

export type Column3Mode = 'guide' | 'highlights' | 'notes' | 'lookup' | null;
export type CursorMode = 'pointer' | 'highlight' | 'note' | 'erase' | 'lookup';

type ExamHeaderProps = {
  examTitle: string;
  level: string;
  mode: 'exam' | 'practice';
  isLoggedIn?: boolean;
  remainingSeconds?: number | null;
  fontScale: number;
  fontScope?: FontScope;
  answeredCount: number;
  totalQuestions: number;
  saveStatus: 'saving' | 'saved' | 'error';
  bookmarked: boolean;
  readingPage?: { current: number; total: number; label?: string };
  column3Mode?: Column3Mode;
  onOpenColumn3Tab?: (tab: 'guide' | 'highlights' | 'notes' | 'lookup') => void;
  onCloseColumn3?: () => void;
  onToggleGuide?: () => void;
  onModeChange?: (nextMode: 'exam' | 'practice') => void;
  onFontScaleChange: (next: number) => void;
  onFontScopeChange?: (nextScope: FontScope) => void;
  onToggleBookmark: () => void;
  cursorMode?: CursorMode;
  highlightColor?: 'yellow' | 'green' | 'pink';
  onCursorModeChange?: (mode: CursorMode) => void;
  onHighlightColorChange?: (color: 'yellow' | 'green' | 'pink') => void;
  highlightActive?: boolean;
  notesOpen?: boolean;
  dictionaryOpen?: boolean;
  onToggleHighlight?: () => void;
  onToggleNotes?: () => void;
  onToggleDictionary?: () => void;
  onSubmit: () => void;
  onExit: () => void;
};

export function ExamHeader({
  examTitle,
  level: _level,
  mode,
  isLoggedIn = true,
  remainingSeconds,
  fontScale,
  fontScope,
  answeredCount,
  totalQuestions,
  saveStatus,
  bookmarked,
  readingPage: _readingPage,
  column3Mode = null,
  onOpenColumn3Tab,
  onCloseColumn3,
  onToggleGuide,
  onModeChange: _onModeChange,
  onFontScaleChange,
  onFontScopeChange,
  onToggleBookmark,
  cursorMode = 'pointer',
  highlightColor = 'yellow',
  onCursorModeChange,
  onHighlightColorChange,
  onSubmit,
  onExit,
}: ExamHeaderProps) {
  const [fontPopoverOpen, setFontPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [flagPopoverOpen, setFlagPopoverOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const flagPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setFontPopoverOpen(false);
      }
      if (flagPopoverRef.current && !flagPopoverRef.current.contains(target)) {
        setFlagPopoverOpen(false);
      }
    };
    if (fontPopoverOpen || flagPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fontPopoverOpen, flagPopoverOpen]);

  const statusLabel =
    saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'error' ? 'Chưa đồng bộ' : 'Đã đồng bộ an toàn';

  const isInteractiveColumn3Open =
    column3Mode === 'highlights' || column3Mode === 'notes' || column3Mode === 'lookup';

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* ================= LEFT SECTION ================= */}
        <div className={styles.headerLeft}>
          <button className={styles.exitButton} type="button" onClick={onExit} aria-label="Thoát phòng thi">
            <span aria-hidden="true">×</span>
            <small>Thoát</small>
          </button>
          <span className={styles.examBrand} aria-label="SHD">SHD</span>

          {!isLoggedIn ? (
            /* TRẠNG THÁI CHƯA ĐĂNG KÝ/ĐĂNG NHẬP: Hiển thị Tên đề bên cạnh Logo SHD */
            <div className={styles.unauthExamTitleWrapper}>
              <span className={styles.unauthExamTitle}>{examTitle}</span>
            </div>
          ) : (
            /* TRẠNG THÁI ĐÃ ĐĂNG NHẬP: Hiển thị Hàng nút chức năng bên cạnh Logo SHD (Ảnh 3 & 4) */
            onCursorModeChange && (
              <div className={styles.headerCursorToolbar} role="toolbar" aria-label="Thanh công cụ bài đọc">
                {/* 1. Nút con trỏ độc lập [ ↖ ] */}
                <button
                  type="button"
                  className={`${styles.headerCursorBtn} ${cursorMode === 'pointer' ? styles.headerCursorBtnActive : ''}`}
                  onClick={() => onCursorModeChange('pointer')}
                  title="Con trỏ thông thường"
                  aria-label="Con trỏ chuột"
                  aria-pressed={cursorMode === 'pointer'}
                >
                  <Navigation size={14} className={styles.headerPointerIcon} />
                </button>

                {/* 2. Cụm Capsule nối liền [ Chấm màu | ✎ Highlight | 📄 Ghi chú | ⌫ ] */}
                <div className={styles.headerAnnotateCapsule}>
                  <button
                    type="button"
                    className={styles.headerColorDotBtn}
                    style={{
                      backgroundColor:
                        highlightColor === 'yellow' ? '#fde047' : highlightColor === 'green' ? '#86efac' : '#f472b6',
                    }}
                    onClick={() => {
                      const nextColor =
                        highlightColor === 'yellow' ? 'green' : highlightColor === 'green' ? 'pink' : 'yellow';
                      onHighlightColorChange?.(nextColor);
                    }}
                    title="Đổi màu highlight (Vàng / Xanh / Hồng)"
                    aria-label="Đổi màu highlight"
                  />

                  <span className={styles.headerCapsuleDivider} />

                  <button
                    type="button"
                    className={`${styles.headerCapsuleItem} ${cursorMode === 'highlight' ? styles.headerCapsuleItemActive : ''}`}
                    onClick={() => onCursorModeChange('highlight')}
                    title="Chế độ Highlight bài đọc"
                    aria-pressed={cursorMode === 'highlight'}
                  >
                    <PenLine size={13} />
                    <span>Highlight</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.headerCapsuleItem} ${cursorMode === 'note' ? styles.headerCapsuleItemActive : ''}`}
                    onClick={() => onCursorModeChange('note')}
                    title="Chế độ Ghi chú trích dẫn"
                    aria-pressed={cursorMode === 'note'}
                  >
                    <FileText size={13} />
                    <span>Ghi chú</span>
                  </button>

                  <span className={styles.headerCapsuleDivider} />

                  <button
                    type="button"
                    className={`${styles.headerCapsuleItem} ${styles.headerEraserBtn} ${cursorMode === 'erase' ? styles.headerCapsuleItemActive : ''}`}
                    onClick={() => onCursorModeChange('erase')}
                    title="Xoá highlight"
                    aria-label="Xoá highlight"
                    aria-pressed={cursorMode === 'erase'}
                  >
                    <Eraser size={13} />
                  </button>
                </div>

                {/* 3. Nút riêng biệt [ 📄✨ Tra nghĩa ] */}
                <button
                  type="button"
                  className={`${styles.headerLookupCapsule} ${cursorMode === 'lookup' ? styles.headerLookupCapsuleActive : ''}`}
                  onClick={() => onCursorModeChange('lookup')}
                  title="Tra nghĩa 3 cấp độ"
                  aria-pressed={cursorMode === 'lookup'}
                >
                  <FileSearch size={14} />
                  <span>Tra nghĩa</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* ================= CENTER TIMER (CẢ 2 TRẠNG THÁI ĐỀU HIỂN THỊ) ================= */}
        <div className={styles.timer} aria-label="Thời gian còn lại">
          <span>{mode === 'practice' ? 'Thời gian làm bài' : 'Thời gian còn lại'}</span>
          <strong
            className={
              remainingSeconds !== null && remainingSeconds !== undefined && remainingSeconds < 300
                ? styles.timerValueWarning
                : ''
            }
          >
            {mode === 'practice' || remainingSeconds === null || remainingSeconds === undefined
              ? '∞'
              : formatTime(remainingSeconds)}
          </strong>
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className={styles.headerRight}>
          <div className={styles.headerTools}>
            {!isLoggedIn ? (
              /* TRẠNG THÁI CHƯA ĐĂNG NHẬP/ĐĂNG KÝ: Chỉ hiển thị Cỡ chữ, Cờ báo lỗi góp ý, và nút Đăng nhập */
              <>
                {/* 1. Chức năng Cỡ Chữ Aa */}
                <div className={styles.fontPopoverContainer} ref={popoverRef}>
                  <button
                    type="button"
                    className={`${styles.fontScaleTrigger} ${fontPopoverOpen ? styles.fontScaleTriggerActive : ''}`}
                    onClick={() => setFontPopoverOpen((v) => !v)}
                    aria-expanded={fontPopoverOpen}
                    title="Cỡ chữ"
                  >
                    Aa
                  </button>
                  {fontPopoverOpen && (
                    <FontSizePopover
                      fontScale={fontScale}
                      onFontScaleChange={onFontScaleChange}
                      scope={fontScope ?? { passage: true, questions: true, guide: true }}
                      onScopeChange={onFontScopeChange ?? (() => undefined)}
                      onClose={() => setFontPopoverOpen(false)}
                    />
                  )}
                </div>

                {/* 2. Chức năng Cờ báo lỗi góp ý */}
                <div className={styles.flagPopoverContainer} ref={flagPopoverRef}>
                  <button
                    type="button"
                    className={`${styles.flagIconButton} ${bookmarked ? styles.flagIconButtonActive : ''} ${
                      flagPopoverOpen ? styles.flagIconButtonOpen : ''
                    }`}
                    onClick={() => setFlagPopoverOpen((v) => !v)}
                    title="Báo lỗi / Góp ý"
                    aria-label="Báo lỗi / Góp ý"
                    aria-expanded={flagPopoverOpen}
                  >
                    <Flag size={14} className={bookmarked ? styles.flagIconFill : ''} />
                  </button>

                  {flagPopoverOpen && (
                    <div className={styles.flagFeedbackCard} role="dialog" aria-label="Báo lỗi / Góp ý">
                      <div className={styles.flagFeedbackHeader}>
                        <strong>Báo lỗi / Góp ý</strong>
                        <p>Gửi phản hồi về câu hỏi hoặc bài này cho SHD.</p>
                      </div>

                      <button
                        type="button"
                        className={`${styles.flagToggleRow} ${bookmarked ? styles.flagToggleRowActive : ''}`}
                        onClick={() => onToggleBookmark()}
                      >
                        <Flag size={13} className={bookmarked ? styles.flagIconFill : ''} />
                        <span>{bookmarked ? 'Bỏ cắm cờ câu này' : 'Cắm cờ xem lại câu này'}</span>
                      </button>

                      <div className={styles.flagFeedbackForm}>
                        <input
                          type="text"
                          placeholder="Nhập phản hồi ngắn..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className={styles.flagFeedbackInput}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && feedbackText.trim()) {
                              alert('Cảm ơn bạn đã gửi phản hồi cho SHD!');
                              setFeedbackText('');
                              setFlagPopoverOpen(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.flagFeedbackSubmit}
                          onClick={() => {
                            if (feedbackText.trim()) {
                              alert('Cảm ơn bạn đã gửi phản hồi cho SHD!');
                              setFeedbackText('');
                              setFlagPopoverOpen(false);
                            }
                          }}
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Nút Nộp bài ở trạng thái chưa đăng ký */}
                <button className={styles.submitButton} type="button" onClick={onSubmit}>
                  Nộp bài
                </button>
              </>
            ) : (
              /* TRẠNG THÁI ĐÃ ĐĂNG NHẬP: Hiển thị đầy đủ mọi tính năng đã duyệt */
              <>
                <span className={styles.headerProgress}>
                  Đã làm: <strong>{answeredCount}/{totalQuestions}</strong>
                </span>
                <span className={styles.saveStatus} aria-live="polite">{statusLabel}</span>

                {/* Nút riêng biệt "HƯỚNG DẪN LÀM BÀI" */}
                {onToggleGuide && (
                  <button
                    type="button"
                    className={`${styles.headerGuideBtn} ${column3Mode === 'guide' ? styles.headerGuideBtnActive : ''}`}
                    onClick={onToggleGuide}
                    title="Mở hướng dẫn làm bài từng bước"
                    aria-label="Hướng dẫn làm bài"
                    aria-pressed={column3Mode === 'guide'}
                  >
                    <Lightbulb size={13} />
                    <span>HƯỚNG DẪN LÀM BÀI</span>
                  </button>
                )}

                {/* Nút biến hình Top-Right Morphing */}
                {onOpenColumn3Tab && (
                  !isInteractiveColumn3Open ? (
                    <button
                      type="button"
                      className={styles.column3ToggleTrigger}
                      onClick={() => onOpenColumn3Tab('highlights')}
                      title="Mở tiện ích Highlight, Ghi chú và Tra nghĩa"
                      aria-label="Mở tiện ích tương tác"
                    >
                      <PanelRight size={15} />
                    </button>
                  ) : (
                    <div className={styles.morphedTabsCapsule}>
                      {/* Tab 1: Highlight */}
                      <button
                        type="button"
                        className={`${styles.morphedTabBtn} ${column3Mode === 'highlights' ? styles.morphedTabBtnActive : ''}`}
                        onClick={() => onOpenColumn3Tab('highlights')}
                        title="Highlight"
                        aria-label="Highlight"
                      >
                        <PenLine size={13} />
                        {column3Mode === 'highlights' && <span>Highlight</span>}
                      </button>

                      {/* Tab 2: Ghi chú */}
                      <button
                        type="button"
                        className={`${styles.morphedTabBtn} ${column3Mode === 'notes' ? styles.morphedTabBtnActive : ''}`}
                        onClick={() => onOpenColumn3Tab('notes')}
                        title="Ghi chú"
                        aria-label="Ghi chú"
                      >
                        <FileText size={13} />
                        {column3Mode === 'notes' && <span>Ghi chú</span>}
                      </button>

                      {/* Tab 3: Tra nghĩa */}
                      <button
                        type="button"
                        className={`${styles.morphedTabBtn} ${column3Mode === 'lookup' ? styles.morphedTabBtnActive : ''}`}
                        onClick={() => onOpenColumn3Tab('lookup')}
                        title="Tra nghĩa"
                        aria-label="Tra nghĩa"
                      >
                        <FileSearch size={13} />
                        {column3Mode === 'lookup' && <span>Tra nghĩa</span>}
                      </button>

                      {/* Nút đóng [X] */}
                      {onCloseColumn3 && (
                        <button
                          type="button"
                          className={styles.morphedCapsuleCloseBtn}
                          onClick={onCloseColumn3}
                          title="Đóng tiện ích"
                          aria-label="Đóng tiện ích"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  )
                )}

                {/* Nút Cỡ Chữ Aa */}
                <div className={styles.fontPopoverContainer} ref={popoverRef}>
                  <button
                    type="button"
                    className={`${styles.fontScaleTrigger} ${fontPopoverOpen ? styles.fontScaleTriggerActive : ''}`}
                    onClick={() => setFontPopoverOpen((v) => !v)}
                    aria-expanded={fontPopoverOpen}
                    title="Cỡ chữ"
                  >
                    Aa
                  </button>
                  {fontPopoverOpen && (
                    <FontSizePopover
                      fontScale={fontScale}
                      onFontScaleChange={onFontScaleChange}
                      scope={fontScope ?? { passage: true, questions: true, guide: true }}
                      onScopeChange={onFontScopeChange ?? (() => undefined)}
                      onClose={() => setFontPopoverOpen(false)}
                    />
                  )}
                </div>

                {/* Nút Cờ xem lại */}
                <div className={styles.flagPopoverContainer} ref={flagPopoverRef}>
                  <button
                    type="button"
                    className={`${styles.flagIconButton} ${bookmarked ? styles.flagIconButtonActive : ''} ${
                      flagPopoverOpen ? styles.flagIconButtonOpen : ''
                    }`}
                    onClick={() => setFlagPopoverOpen((v) => !v)}
                    title="Báo lỗi / Góp ý"
                    aria-label="Báo lỗi / Góp ý"
                    aria-expanded={flagPopoverOpen}
                  >
                    <Flag size={14} className={bookmarked ? styles.flagIconFill : ''} />
                  </button>

                  {flagPopoverOpen && (
                    <div className={styles.flagFeedbackCard} role="dialog" aria-label="Báo lỗi / Góp ý">
                      <div className={styles.flagFeedbackHeader}>
                        <strong>Báo lỗi / Góp ý</strong>
                        <p>Gửi phản hồi về câu hỏi hoặc bài này cho SHD.</p>
                      </div>

                      <button
                        type="button"
                        className={`${styles.flagToggleRow} ${bookmarked ? styles.flagToggleRowActive : ''}`}
                        onClick={() => onToggleBookmark()}
                      >
                        <Flag size={13} className={bookmarked ? styles.flagIconFill : ''} />
                        <span>{bookmarked ? 'Bỏ cắm cờ câu này' : 'Cắm cờ xem lại câu này'}</span>
                      </button>

                      <div className={styles.flagFeedbackForm}>
                        <input
                          type="text"
                          placeholder="Nhập phản hồi ngắn..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className={styles.flagFeedbackInput}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && feedbackText.trim()) {
                              alert('Cảm ơn bạn đã gửi phản hồi cho SHD!');
                              setFeedbackText('');
                              setFlagPopoverOpen(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.flagFeedbackSubmit}
                          onClick={() => {
                            if (feedbackText.trim()) {
                              alert('Cảm ơn bạn đã gửi phản hồi cho SHD!');
                              setFeedbackText('');
                              setFlagPopoverOpen(false);
                            }
                          }}
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nộp bài */}
                <button className={styles.submitButton} type="button" onClick={onSubmit}>
                  Nộp bài
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
