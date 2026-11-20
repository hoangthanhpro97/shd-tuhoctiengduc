'use client';

import { Check } from 'lucide-react';
import styles from './ExamRoom.module.css';

export type FontScope = {
  passage: boolean;
  questions: boolean;
  guide: boolean;
};

type FontSizeLevel = {
  scale: number;
  label: string;
  height: number;
};

const FONT_LEVELS: FontSizeLevel[] = [
  { scale: 0.9, label: 'Cỡ nhỏ', height: 12 },
  { scale: 1.0, label: 'Cỡ gốc', height: 18 },
  { scale: 1.1, label: 'Cỡ vừa', height: 24 },
  { scale: 1.2, label: 'Cỡ lớn', height: 30 },
  { scale: 1.3, label: 'Cỡ rất lớn', height: 36 },
];

type FontSizePopoverProps = {
  fontScale: number;
  onFontScaleChange: (nextScale: number) => void;
  scope: FontScope;
  onScopeChange: (nextScope: FontScope) => void;
  onClose: () => void;
};

export function FontSizePopover({
  fontScale,
  onFontScaleChange,
  scope,
  onScopeChange,
}: FontSizePopoverProps) {
  // Tìm cấp độ gần nhất với fontScale hiện tại
  const currentLevelIndex = FONT_LEVELS.reduce((closest, curr, index) => {
    return Math.abs(curr.scale - fontScale) < Math.abs(FONT_LEVELS[closest].scale - fontScale)
      ? index
      : closest;
  }, 1);

  const currentLevel = FONT_LEVELS[currentLevelIndex];

  const toggleScope = (key: keyof FontScope) => {
    const activeCount = Object.values(scope).filter(Boolean).length;
    // Không cho phép tắt hết cả 3 vùng
    if (scope[key] && activeCount <= 1) {
      return;
    }
    onScopeChange({
      ...scope,
      [key]: !scope[key],
    });
  };

  return (
    <div className={styles.fontPopover} role="dialog" aria-label="Điều chỉnh cỡ chữ">
      <div className={styles.fontPopoverSection}>
        <span className={styles.fontPopoverHeading}>CỠ CHỮ</span>
        
        {/* 5 thanh chọn cấp độ cỡ chữ */}
        <div className={styles.fontLevelBars}>
          {FONT_LEVELS.map((level, index) => {
            const isSelected = index === currentLevelIndex;
            return (
              <button
                key={level.scale}
                type="button"
                className={`${styles.fontLevelBar} ${isSelected ? styles.fontLevelBarActive : ''}`}
                style={{ height: `${level.height}px` }}
                onClick={() => onFontScaleChange(level.scale)}
                title={level.label}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>
        <div className={styles.fontLevelLabel}>{currentLevel.label}</div>
      </div>

      <div className={styles.fontPopoverDivider} />

      <div className={styles.fontPopoverSection}>
        <span className={styles.fontPopoverHeading}>ÁP DỤNG CHO</span>
        
        <div className={styles.fontScopeList}>
          <label className={styles.fontScopeItem}>
            <input
              type="checkbox"
              checked={scope.passage}
              onChange={() => toggleScope('passage')}
              className={styles.fontScopeCheckbox}
            />
            <span className={`${styles.fontScopeCustomBox} ${scope.passage ? styles.fontScopeCustomBoxActive : ''}`}>
              {scope.passage && <Check size={11} strokeWidth={3} />}
            </span>
            <span className={styles.fontScopeText}>Bài đọc</span>
          </label>

          <label className={styles.fontScopeItem}>
            <input
              type="checkbox"
              checked={scope.questions}
              onChange={() => toggleScope('questions')}
              className={styles.fontScopeCheckbox}
            />
            <span className={`${styles.fontScopeCustomBox} ${scope.questions ? styles.fontScopeCustomBoxActive : ''}`}>
              {scope.questions && <Check size={11} strokeWidth={3} />}
            </span>
            <span className={styles.fontScopeText}>Câu hỏi</span>
          </label>

          <label className={styles.fontScopeItem}>
            <input
              type="checkbox"
              checked={scope.guide}
              onChange={() => toggleScope('guide')}
              className={styles.fontScopeCheckbox}
            />
            <span className={`${styles.fontScopeCustomBox} ${scope.guide ? styles.fontScopeCustomBoxActive : ''}`}>
              {scope.guide && <Check size={11} strokeWidth={3} />}
            </span>
            <span className={styles.fontScopeText}>Hỗ trợ làm bài</span>
          </label>
        </div>

        <p className={styles.fontPopoverFootnote}>
          Cần ít nhất một vùng để chỉnh cỡ chữ.
        </p>
      </div>
    </div>
  );
}
