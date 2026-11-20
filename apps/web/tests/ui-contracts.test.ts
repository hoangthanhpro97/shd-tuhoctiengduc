import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

const repoRoot = process.cwd().endsWith('apps\\web') || process.cwd().endsWith('apps/web') ? resolve(process.cwd(), '../..') : process.cwd();
const repoFile = (file: string) => resolve(repoRoot, file);

describe('SHD UI refactor invariants', () => {
  it('uses a distraction-free exam route group', async () => {
    const fs = await import('node:fs');
    expect(fs.existsSync(repoFile('apps/web/app/(exam)/lam-bai/[attemptId]/layout.tsx'))).toBe(true);
    expect(fs.existsSync(repoFile('apps/web/app/(public)/layout.tsx'))).toBe(true);
    expect(fs.existsSync(repoFile('apps/web/app/not-found.tsx'))).toBe(true);
  });

  it('ships all eight learning/account route families', async () => {
    const fs = await import('node:fs');
    const routes = [
      'apps/web/app/(public)/luyen-nghe/page.tsx',
      'apps/web/app/(public)/luyen-doc/page.tsx',
      'apps/web/app/(public)/chep-chinh-ta/page.tsx',
      'apps/web/app/(public)/bai-mau-schreiben/page.tsx',
      'apps/web/app/(public)/bai-mau-sprechen/page.tsx',
      'apps/web/app/(public)/tai-khoan/page.tsx',
      'apps/web/app/(public)/tai-khoan-pro/page.tsx',
      'apps/web/components/auth/AuthModal.tsx',
    ];
    expect(routes.every((route) => fs.existsSync(repoFile(route)))).toBe(true);
  });

  it('ships deep-learning interaction components and safe account redemption boundary', async () => {
    const fs = await import('node:fs');
    const files = [
      'apps/web/components/review/ReviewTabs.tsx',
      'apps/web/components/review/ExplanationSteps.tsx',
      'apps/web/components/review/VocabularyPanel.tsx',
      'apps/web/components/review/EvidenceReader.tsx',
      'apps/web/components/review/AudioTranscript.tsx',
      'apps/web/components/diktat/ShadowingWorkspace.tsx',
      'apps/web/components/model-answers/ModelAnswerExercise.tsx',
      'apps/web/components/account/GiftCodeCard.tsx',
      'apps/web/app/api/v1/account/gift-code/route.ts',
    ];
    expect(files.every((file) => fs.existsSync(repoFile(file)))).toBe(true);
    const grading = fs.readFileSync(repoFile('packages/contracts/src/grading.ts'), 'utf8');
    expect(grading).toContain('learningMetadata');
    expect(grading).not.toContain('answerKey');
  });

  it('ships the typed Sprechen Hub contract, fixtures, and viewers', async () => {
    const fs = await import('node:fs');
    const files = [
      'packages/contracts/src/speaking.ts',
      'apps/web/data/speaking-fixtures.ts',
      'apps/web/components/model-answers/speaking/SpeakingDialogViewer.tsx',
      'apps/web/components/model-answers/speaking/SpeakingSlidesViewer.tsx',
      'apps/web/components/model-answers/speaking/SpeakingFeedbackViewer.tsx',
      'apps/web/components/model-answers/speaking/RedemittelGrid.tsx',
      'apps/web/components/model-answers/speaking/SpeakingPracticeWorkspace.tsx',
      'apps/web/components/model-answers/speaking/TeacherSpeakingCta.tsx',
    ];
    expect(files.every((file) => fs.existsSync(repoFile(file)))).toBe(true);
    const fixture = fs.readFileSync(repoFile('apps/web/data/speaking-fixtures.ts'), 'utf8');
    const slides = fs.readFileSync(repoFile('apps/web/components/model-answers/speaking/SpeakingSlidesViewer.tsx'), 'utf8');
    const practice = fs.readFileSync(repoFile('apps/web/components/model-answers/speaking/SpeakingPracticeWorkspace.tsx'), 'utf8');
    expect(fixture).toContain('SpeakingTaskSchema.array().parse');
    expect(fixture).toContain("'goethe_b1'");
    expect(fixture).toContain("'osd_zb1'");
    expect(fixture).toContain("'osd_zdo_b1'");
    expect(slides).not.toContain('dangerouslySetInnerHTML');
    expect(slides).toContain('text-[#da2527]');
    expect(practice).toContain('localStorage');
    expect(practice).toContain('durationSeconds');
  });
});
