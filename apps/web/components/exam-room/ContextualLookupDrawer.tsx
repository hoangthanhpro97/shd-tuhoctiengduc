'use client';

import { useState } from 'react';
import { Volume2, ArrowRight, BookOpen, Layers, GitFork, Sparkles, CheckCircle2 } from 'lucide-react';
import type { AnalysisResult } from '../../lib/reading-analyzer';
import { analyzeReadingText } from '../../lib/reading-analyzer';
import styles from './ExamRoom.module.css';

export type ContextualLookupDrawerProps = {
  analysis: AnalysisResult | null;
  fullPassage: string;
  part: number;
  onHoverQuote: (quote: string | null) => void;
  onClose: () => void;
};

export function ContextualLookupDrawer({
  analysis: initialAnalysis,
  fullPassage,
  part,
  onHoverQuote,
  onClose: _onClose,
}: ContextualLookupDrawerProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(initialAnalysis);
  const [sentenceSubTab, setSentenceSubTab] = useState<'main' | 'detail'>('main');

  // Update if initialAnalysis changes from parent selection
  if (initialAnalysis && (!currentAnalysis || initialAnalysis.originalText !== currentAnalysis.originalText)) {
    setCurrentAnalysis(initialAnalysis);
  }

  const analysis = currentAnalysis ?? initialAnalysis;

  if (!analysis) {
    return (
      <div className={styles.lookupEmptyState}>
        <Sparkles className={styles.lookupEmptyIcon} size={32} />
        <h4>Tra nghĩa thông minh 3 cấp độ</h4>
        <p>Bôi đen bất kỳ từ, câu hoặc đoạn văn nào trong bài đọc để tra cứu tức thì:</p>
        <div className={styles.lookupEmptySteps}>
          <div className={styles.lookupStepItem}>
            <span className={styles.lookupStepBadge}>1</span>
            <div>
              <strong>Hiểu từ:</strong> Chọn 1 từ để xem từ loại, giống, phát âm và ngữ nghĩa.
            </div>
          </div>
          <div className={styles.lookupStepItem}>
            <span className={styles.lookupStepBadge}>2</span>
            <div>
              <strong>Đọc cấu trúc:</strong> Chọn 1 câu để bóc tách ngữ pháp và ý chính.
            </div>
          </div>
          <div className={styles.lookupStepItem}>
            <span className={styles.lookupStepBadge}>3</span>
            <div>
              <strong>Đọc liên kết:</strong> Chọn cả đoạn để xem sơ đồ mạch ý và ánh xạ 2 chiều.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pronounce German word using Web Speech API
  const handlePronounce = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Switch to Sentence Analysis when clicking "Xem cả câu ›"
  const handleViewSentence = (sentenceDe: string) => {
    const sentenceAnalysis = analyzeReadingText(sentenceDe, fullPassage, part);
    setCurrentAnalysis(sentenceAnalysis);
  };

  return (
    <div className={styles.lookupContainer}>
      {/* Level Header Navigation */}
      <div className={styles.lookupHeader}>
        <div className={styles.lookupLevelTabs}>
          <button
            type="button"
            className={`${styles.lookupLevelTab} ${analysis.level === 'word' ? styles.lookupLevelTabActive : ''}`}
            onClick={() => {
              if (analysis.level !== 'word') {
                const words = analysis.originalText.split(/\s+/);
                setCurrentAnalysis(analyzeReadingText(words[0] ?? analysis.originalText, fullPassage, part));
              }
            }}
          >
            <BookOpen size={13} />
            <span>Hiểu từ</span>
          </button>
          <button
            type="button"
            className={`${styles.lookupLevelTab} ${analysis.level === 'sentence' ? styles.lookupLevelTabActive : ''}`}
            onClick={() => {
              if (analysis.level !== 'sentence') {
                const sentences = analysis.originalText.split(/[.!?]+/);
                setCurrentAnalysis(analyzeReadingText(sentences[0] ?? analysis.originalText, fullPassage, part));
              }
            }}
          >
            <Layers size={13} />
            <span>Đọc cấu trúc</span>
          </button>
          <button
            type="button"
            className={`${styles.lookupLevelTab} ${analysis.level === 'discourse' ? styles.lookupLevelTabActive : ''}`}
            onClick={() => {
              if (analysis.level !== 'discourse') {
                setCurrentAnalysis(analyzeReadingText(fullPassage, fullPassage, part));
              }
            }}
          >
            <GitFork size={13} />
            <span>Đọc liên kết</span>
          </button>
        </div>
      </div>

      <div className={styles.lookupContent}>
        {/* ===================== CẤP 1: HIỂU TỪ ===================== */}
        {analysis.level === 'word' && (
          <div className={styles.wordAnalysisPane}>
            <div className={styles.wordHeaderBlock}>
              <div className={styles.wordTitleRow}>
                <h3 className={styles.wordMainText}>{analysis.lemma || analysis.originalText}</h3>
                <button
                  type="button"
                  className={styles.wordAudioButton}
                  onClick={() => handlePronounce(analysis.lemma || analysis.originalText)}
                  title="Nghe phát âm tiếng Đức"
                  aria-label="Phát âm tiếng Đức"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {analysis.ipa && <span className={styles.wordIpa}>{analysis.ipa}</span>}

              <div className={styles.wordMetaBadges}>
                {analysis.gender && (
                  <span className={`${styles.genderBadge} ${styles[`gender_${analysis.gender}`]}`}>
                    {analysis.gender}
                  </span>
                )}
                <span className={styles.posBadge}>{analysis.partOfSpeech}</span>
                {analysis.pluralForm && (
                  <span className={styles.pluralBadge}>Số nhiều: {analysis.pluralForm}</span>
                )}
              </div>
            </div>

            <div className={styles.wordMeaningsBlock}>
              <div className={styles.meaningItem}>
                <label className={styles.meaningLabel}>Nghĩa tiếng Việt</label>
                <p className={styles.meaningTextPrimary}>{analysis.generalMeaningVi}</p>
              </div>

              <div className={styles.meaningItem}>
                <label className={styles.meaningLabel}>Nghĩa trong ngữ cảnh bài thi</label>
                <p className={styles.meaningTextContext}>{analysis.contextMeaningVi}</p>
              </div>
            </div>

            {analysis.exampleSentenceDe && (
              <div className={styles.wordExampleCard}>
                <div className={styles.wordExampleHeader}>
                  <label className={styles.meaningLabel}>Ngữ cảnh trong bài đọc</label>
                  <button
                    type="button"
                    className={styles.viewSentenceLink}
                    onClick={() => handleViewSentence(analysis.exampleSentenceDe)}
                  >
                    <span>Xem cả câu</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                <p className={styles.exampleDe}>&ldquo;{analysis.exampleSentenceDe}&rdquo;</p>
                <p className={styles.exampleVi}>{analysis.exampleSentenceVi}</p>
              </div>
            )}
          </div>
        )}

        {/* ===================== CẤP 2: ĐỌC CẤU TRÚC ===================== */}
        {analysis.level === 'sentence' && (
          <div className={styles.sentenceAnalysisPane}>
            <div className={styles.sentenceSubNav}>
              <button
                type="button"
                className={`${styles.sentenceSubTab} ${sentenceSubTab === 'main' ? styles.sentenceSubTabActive : ''}`}
                onClick={() => setSentenceSubTab('main')}
              >
                Main idea (Ý chính)
              </button>
              <button
                type="button"
                className={`${styles.sentenceSubTab} ${sentenceSubTab === 'detail' ? styles.sentenceSubTabActive : ''}`}
                onClick={() => setSentenceSubTab('detail')}
              >
                Detail (Cấu trúc câu)
              </button>
            </div>

            {sentenceSubTab === 'main' ? (
              <div className={styles.sentenceMainIdeaBlock}>
                <div className={styles.sentenceOriginalQuote}>
                  <p className={styles.quoteDe}>&ldquo;{analysis.originalText}&rdquo;</p>
                </div>

                <div className={styles.sentenceTranslationBox}>
                  <label className={styles.meaningLabel}>Dịch nghĩa tiếng Việt</label>
                  <p className={styles.translationText}>{analysis.vietnameseTranslation}</p>
                </div>

                <div className={styles.sentenceIdeaBox}>
                  <label className={styles.meaningLabel}>Ý chính cần nắm</label>
                  <p className={styles.ideaText}>{analysis.mainIdeaVi}</p>
                </div>

                <div className={styles.grammarHighlightCard}>
                  <span className={styles.grammarCategoryTag}>{analysis.grammarCategory}</span>
                  <p className={styles.grammarPointText}>{analysis.keyGrammarPoint}</p>
                </div>
              </div>
            ) : (
              <div className={styles.sentenceDetailBlock}>
                <div className={styles.feldermodellNotice}>
                  <strong>Mô hình cấu trúc câu tiếng Đức (Feldermodell)</strong>
                  <p>Phân tích vị trí động từ và các thành phần câu:</p>
                </div>

                <div className={styles.fieldsList}>
                  {analysis.fields.map((field, idx) => (
                    <div key={idx} className={styles.fieldCard}>
                      <div className={styles.fieldHeader}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <span className={styles.fieldRoleBadge}>{field.germanRole}</span>
                      </div>
                      <div className={styles.fieldText}>{field.text}</div>
                      <div className={styles.fieldExplanation}>{field.vietnameseExplanation}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.grammarSummaryCard}>
                  <strong>Quy tắc ngữ pháp:</strong>
                  <p>{analysis.keyGrammarPoint}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== CẤP 3: ĐỌC LIÊN KẾT ===================== */}
        {analysis.level === 'discourse' && (
          <div className={styles.discourseAnalysisPane}>
            <div className={styles.discourseHeaderBlock}>
              <h4 className={styles.discourseTitle}>{analysis.title}</h4>
              <p className={styles.discourseHint}>
                💡 <em>Rê chuột vào câu tiếng Việt gạch chân để tự động soi dẫn chứng gốc trên bài đọc.</em>
              </p>
            </div>

            {/* Sơ đồ Mạch ý chuỗi mũi tên */}
            <div className={styles.flowChainBlock}>
              <label className={styles.meaningLabel}>Sơ đồ Mạch ý</label>
              <div className={styles.flowStepsContainer}>
                {analysis.flowSteps.map((step, idx) => (
                  <div key={idx} className={styles.flowStepWrapper}>
                    <div className={styles.flowStepPill}>
                      <span className={styles.flowStepNumber}>{idx + 1}</span>
                      <span className={styles.flowStepText}>{step}</span>
                    </div>
                    {idx < analysis.flowSteps.length - 1 && (
                      <span className={styles.flowArrow}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nhóm câu liên kết & Ánh xạ Highlight 2 chiều */}
            <div className={styles.sentenceGroupsList}>
              <label className={styles.meaningLabel}>Các nhóm câu & Dẫn chứng tương ứng</label>
              {analysis.sentenceGroups.map((group) => (
                <div
                  key={group.id}
                  className={`${styles.discourseGroupCard} ${styles[`groupColor_${group.color}`]}`}
                  onMouseEnter={() => onHoverQuote(group.sourceQuote)}
                  onMouseLeave={() => onHoverQuote(null)}
                >
                  <div className={styles.groupCardHeader}>
                    <span className={`${styles.colorDot} ${styles[`dot_${group.color}`]}`} />
                    <strong className={styles.groupCategory}>{group.categoryLabel}</strong>
                  </div>

                  <p className={styles.groupQuoteVi}>
                    <span className={styles.underlinedQuote}>{group.vietnameseSummary}</span>
                  </p>

                  <div className={styles.groupQuoteDe}>
                    <small>Gốc: &ldquo;{group.sourceQuote}&rdquo;</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Khung Tóm lại */}
            {analysis.takeawayVi && (
              <div className={styles.takeawayCard}>
                <div className={styles.takeawayHeader}>
                  <CheckCircle2 size={16} className={styles.takeawayIcon} />
                  <strong>Tóm lại</strong>
                </div>
                <p className={styles.takeawayBody}>{analysis.takeawayVi}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
