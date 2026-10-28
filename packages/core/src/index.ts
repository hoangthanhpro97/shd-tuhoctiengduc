export interface ExamMetadata {
  id: string;
  title: string;
  standard: string;
  level: string;
}

export function createExamMetadata(
  id: string,
  title: string,
  standard: string,
  level: string,
): ExamMetadata {
  return { id, title, standard, level };
}
