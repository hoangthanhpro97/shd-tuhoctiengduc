export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string | undefined;
  instance?: string | undefined;
  code?: string | undefined;
}

export function createProblemDetails(
  status: number,
  title: string,
  detail?: string,
): ProblemDetails {
  return {
    type: 'about:blank',
    title,
    status,
    detail,
  };
}
