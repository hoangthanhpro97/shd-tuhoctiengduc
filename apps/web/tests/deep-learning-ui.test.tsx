import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

const repoRoot = process.cwd().endsWith('apps\\web') || process.cwd().endsWith('apps/web') ? resolve(process.cwd(), '../..') : process.cwd();
const repoFile = (file: string) => resolve(repoRoot, file);

describe('Deep Learning UX implementation boundaries', () => {
  it('keeps browser-only pronunciation and recording in client components', async () => {
    const fs = await import('node:fs');
    const diktat = fs.readFileSync(repoFile('apps/web/components/diktat/DiktatWorkspace.tsx'), 'utf8');
    const vocabulary = fs.readFileSync(repoFile('apps/web/components/review/VocabularyPanel.tsx'), 'utf8');
    expect(diktat.startsWith("'use client';")).toBe(true);
    expect(diktat).toContain('MediaRecorder');
    expect(diktat).toContain('URL.revokeObjectURL');
    expect(diktat).toContain('speechSynthesis');
    expect(vocabulary.startsWith("'use client';")).toBe(true);
    expect(vocabulary).toContain("utterance.lang = 'de-DE'");
  });

  it('provides all review and model-answer learning steps', async () => {
    const fs = await import('node:fs');
    const explanation = fs.readFileSync(repoFile('apps/web/components/review/ExplanationSteps.tsx'), 'utf8');
    const exercise = fs.readFileSync(repoFile('apps/web/components/model-answers/ModelAnswerExercise.tsx'), 'utf8');
    const detail = fs.readFileSync(repoFile('apps/web/components/model-answers/ModelAnswerDetail.tsx'), 'utf8');
    expect(explanation).toContain('Định vị đáp án');
    expect(explanation).toContain('Nghe từ đây');
    expect(explanation).toContain('paraphrases');
    expect(exercise).toContain('Kiểm tra đáp án');
    expect(detail).toContain('Dàn ý chi tiết');
  });

  it('does not use localStorage to redeem gift-code entitlements', async () => {
    const fs = await import('node:fs');
    const route = fs.readFileSync(repoFile('apps/web/app/api/v1/account/gift-code/route.ts'), 'utf8');
    expect(route).toContain('getVisitorTokenHash');
    expect(route).not.toContain('localStorage');
  });
});
