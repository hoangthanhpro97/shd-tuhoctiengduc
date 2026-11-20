import type { ExamPublicPayload, ServerExamKeyPayload } from '@shd/contracts';

export type SeedExam = {
  fileName: string;
  publicPayload: ExamPublicPayload;
  serverPayload: ServerExamKeyPayload;
  contentHash: string;
};

export type SeedMode = 'draft' | 'published';
