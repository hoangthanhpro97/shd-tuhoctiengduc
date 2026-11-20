export * from '@shd/contracts';
export type {
  WorkstationProvider,
  WorkstationLevel,
  WorkstationSkill,
  WorkstationMode,
  WorkstationTranscriptTurn,
  WorkstationListeningStimulus,
  WorkstationReadingStimulus,
  WorkstationSection,
  WorkstationPayload,
  WorkstationPolicy,
} from '@shd/contracts';
export { resolveWorkstationPolicy } from '@shd/contracts';

export type Column3Mode = 'guide' | 'highlights' | 'notes' | 'lookup' | null;
export type CursorMode = 'pointer' | 'highlight' | 'note' | 'erase' | 'lookup';
export type HighlightColor = 'yellow' | 'green' | 'pink';

export type FontScope = {
  passage: boolean;
  questions: boolean;
  guide: boolean;
};

export interface OverviewQuestionItem {
  id: string;
  order: number;
  part: number;
  answered: boolean;
  flagged: boolean;
}
