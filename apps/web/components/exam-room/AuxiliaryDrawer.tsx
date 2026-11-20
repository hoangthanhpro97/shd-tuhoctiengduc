'use client';

import { useState } from 'react';
import { Lightbulb, X, Trash2, PenLine, FileText, FileSearch, Highlighter, StickyNote } from 'lucide-react';
import type { AnalysisResult } from '../../lib/reading-analyzer';
import { ContextualLookupDrawer } from './ContextualLookupDrawer';
import { ReadingGuideContent, type GuideQuestion } from './ReadingGuidePanel';
import { ListeningGuideContent } from './core/ListeningGuideContent';
import styles from './ExamRoom.module.css';

export type TextHighlight = {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink';
  part: number;
};

export type StudentNote = {
  id: string;
  quote?: string;
  content: string;
  part: number;
  createdAt: string;
};

export type AuxiliaryDrawerProps = {
  width?: number;
  activeTab: 'guide' | 'highlights' | 'notes' | 'lookup';
  mode: 'exam' | 'practice';
  skill?: 'lesen' | 'hoeren';
  highlights: TextHighlight[];
  notes: StudentNote[];
  newNoteDraft: { quote: string; content: string } | null;
  lookupAnalysis: AnalysisResult | null;
  fullPassage: string;
  part: number;
  guideQuestions?: GuideQuestion[];
  currentQuestionId?: string;
  onSelectQuestion?: (id: string) => void;
  onTabChange: (tab: 'guide' | 'highlights' | 'notes' | 'lookup') => void;
  onClose: () => void;
  onSaveNote: (note: { quote?: string; content: string }) => void;
  onCancelNoteDraft: () => void;
  onDeleteNote: (id: string) => void;
  onDeleteHighlight: (id: string) => void;
  onHoverQuote: (quote: string | null) => void;
  onScrollToHighlight?: (highlight: TextHighlight) => void;
};

export function AuxiliaryDrawer({
  width,
  activeTab,
  mode: _mode,
  skill = 'lesen',
  highlights,
  notes,
  newNoteDraft,
  lookupAnalysis,
  fullPassage,
  part,
  guideQuestions = [],
  currentQuestionId = '',
  onSelectQuestion,
  onTabChange,
  onClose,
  onSaveNote,
  onCancelNoteDraft,
  onDeleteNote,
  onDeleteHighlight,
  onHoverQuote,
  onScrollToHighlight,
}: AuxiliaryDrawerProps) {
  const [drawerWidth] = useState(380);
  const [draftContent, setDraftContent] = useState(newNoteDraft?.content ?? '');

  // Synchronize draft when prop updates
  if (newNoteDraft && newNoteDraft.content !== draftContent && draftContent === '') {
    setDraftContent(newNoteDraft.content);
  }

  const effectiveWidth = width ?? drawerWidth;

  const partHighlights = highlights.filter((h) => h.part === part);
  const partNotes = notes.filter((n) => n.part === part);

  return (
    <aside
      className={styles.auxiliaryDrawer}
      style={{ width: `${effectiveWidth}px` }}
      aria-label="Khung tiện ích hỗ trợ đọc hiểu"
    >
      {/* Header: Phân tách rạch ròi giữa Hướng dẫn làm bài chuyên biệt (Bước 7) và Cụm 3 tab icon chia đều (Bước 5) */}
      {activeTab === 'guide' ? (
        <div className={styles.auxiliaryDedicatedHeader}>
          <div className={styles.auxiliaryDedicatedTitle}>
            <Lightbulb size={16} />
            <span>HƯỚNG DẪN LÀM BÀI</span>
          </div>
          <button
            type="button"
            className={styles.auxiliaryCloseBtn}
            onClick={onClose}
            aria-label="Đóng hướng dẫn làm bài"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className={styles.auxiliaryHeader}>
          {/* Hàng chuyển đổi trạng thái của Cột 3 chia 3 ô bằng nhau, chỉ giữ ký hiệu (Bước 5) */}
          <div className={styles.auxiliaryEqualTabsGroup} role="tablist" aria-label="Chuyển chế độ tiện ích">
            {/* Tab 1: Highlight */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'highlights'}
              className={`${styles.auxiliaryEqualTabBtn} ${activeTab === 'highlights' ? styles.auxiliaryEqualTabBtnActive : ''}`}
              onClick={() => onTabChange('highlights')}
              title="Highlight"
              aria-label="Highlight"
            >
              <PenLine size={15} />
            </button>

            {/* Tab 2: Ghi chú */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'notes'}
              className={`${styles.auxiliaryEqualTabBtn} ${activeTab === 'notes' ? styles.auxiliaryEqualTabBtnActive : ''}`}
              onClick={() => onTabChange('notes')}
              title="Ghi chú"
              aria-label="Ghi chú"
            >
              <FileText size={15} />
            </button>

            {/* Tab 3: Tra nghĩa */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lookup'}
              className={`${styles.auxiliaryEqualTabBtn} ${activeTab === 'lookup' ? styles.auxiliaryEqualTabBtnActive : ''}`}
              onClick={() => onTabChange('lookup')}
              title="Tra nghĩa"
              aria-label="Tra nghĩa"
            >
              <FileSearch size={15} />
            </button>
          </div>

          <button
            type="button"
            className={styles.auxiliaryCloseBtn}
            onClick={onClose}
            aria-label="Đóng bảng hỗ trợ"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Drawer Body Content */}
      <div className={styles.auxiliaryBody}>
        {/* ================= TAB 1: HƯỚNG DẪN LÀM BÀI ================= */}
        {activeTab === 'guide' && (
          <div className={styles.guidePane}>
            {skill === 'hoeren' ? (
              <ListeningGuideContent
                part={part}
                questions={guideQuestions}
                currentQuestionId={currentQuestionId}
                onSelectQuestion={onSelectQuestion}
              />
            ) : (
              <ReadingGuideContent
                part={part}
                questions={guideQuestions}
                currentId={currentQuestionId}
                onSelectQuestion={onSelectQuestion}
              />
            )}
          </div>
        )}

        {/* ================= TAB 2: HIGHLIGHTS ================= */}
        {activeTab === 'highlights' && (
          <div className={styles.highlightsPane}>
            <div className={styles.highlightsHeader}>
              <span className={styles.subTitle}>Danh sách đã highlight · Teil {part}</span>
              <span className={styles.counterBadge}>{partHighlights.length} đoạn</span>
            </div>

            {partHighlights.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <Highlighter className={styles.emptyStateIcon} size={28} />
                <p className={styles.emptyStateText}>
                  Chưa có đoạn highlight nào. Chọn công cụ <strong>🖍 Highlight</strong> trên bài đọc và quét để đánh dấu.
                </p>
              </div>
            ) : (
              <div className={styles.highlightsList}>
                {partHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className={`${styles.highlightCard} ${styles[`hlColor_${hl.color}`]}`}
                    onClick={() => onScrollToHighlight?.(hl)}
                  >
                    <span className={`${styles.hlColorDot} ${styles[`dot_${hl.color}`]}`} />
                    <p className={styles.highlightText}>&ldquo;{hl.text}&rdquo;</p>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHighlight(hl.id);
                      }}
                      title="Xóa highlight này"
                      aria-label="Xóa highlight"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: GHI CHÚ (NOTES) ================= */}
        {activeTab === 'notes' && (
          <div className={styles.notesPane}>
            {/* New Note Form when drafting */}
            {newNoteDraft && (
              <div className={styles.newNoteCard}>
                <div className={styles.noteCardTop}>
                  <span className={styles.noteDraftBadge}>Ghi chú mới</span>
                </div>
                {newNoteDraft.quote && (
                  <div className={styles.quoteBlock}>
                    <p className={styles.quoteText}>&ldquo;{newNoteDraft.quote}&rdquo;</p>
                  </div>
                )}
                <textarea
                  className={styles.noteTextarea}
                  placeholder="Nhập ghi chú hoặc suy luận của bạn..."
                  rows={3}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  autoFocus
                />
                <div className={styles.noteActionsRow}>
                  <button
                    type="button"
                    className={styles.noteCancelBtn}
                    onClick={() => {
                      setDraftContent('');
                      onCancelNoteDraft();
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className={styles.noteSaveBtn}
                    onClick={() => {
                      if (draftContent.trim()) {
                        onSaveNote({
                          quote: newNoteDraft.quote,
                          content: draftContent.trim(),
                        });
                        setDraftContent('');
                      }
                    }}
                  >
                    Lưu note
                  </button>
                </div>
              </div>
            )}

            <div className={styles.notesListHeader}>
              <span className={styles.subTitle}>Ghi chú cá nhân ({partNotes.length})</span>
            </div>

            {partNotes.length === 0 && !newNoteDraft ? (
              <div className={styles.emptyStateContainer}>
                <StickyNote className={styles.emptyStateIcon} size={28} />
                <h5 className={styles.emptyStateTitle}>Chưa có ghi chú nào</h5>
                <div className={styles.notesGuideBox}>
                  <div className={styles.notesGuideStep}>
                    <strong>1.</strong> Quét đoạn văn bản bạn muốn ghi chú trong bài đọc.
                  </div>
                  <div className={styles.notesGuideStep}>
                    <strong>2.</strong> Nhập nội dung suy luận hoặc từ khóa và bấm <em>Lưu note</em>.
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.notesList}>
                {partNotes.map((note) => (
                  <div key={note.id} className={styles.savedNoteCard}>
                    {note.quote && (
                      <div className={styles.savedNoteQuote}>
                        <small>&ldquo;{note.quote}&rdquo;</small>
                      </div>
                    )}
                    <p className={styles.savedNoteContent}>{note.content}</p>
                    <div className={styles.savedNoteFooter}>
                      <span className={styles.savedNoteDate}>{note.createdAt}</span>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onDeleteNote(note.id)}
                        title="Xóa ghi chú"
                        aria-label="Xóa ghi chú"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: TRA NGHĨA (LOOKUP) ================= */}
        {activeTab === 'lookup' && (
          <ContextualLookupDrawer
            analysis={lookupAnalysis}
            fullPassage={fullPassage}
            part={part}
            onHoverQuote={onHoverQuote}
            onClose={onClose}
          />
        )}
      </div>
    </aside>
  );
}
