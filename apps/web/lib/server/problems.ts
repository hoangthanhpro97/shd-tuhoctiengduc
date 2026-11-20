import { createProblemDetails, type ProblemCode } from '@shd/contracts';

export function problemResponse(status: number, code: ProblemCode, detail: string, instance?: string): Response {
  return Response.json(createProblemDetails(status, code.replaceAll('_', ' '), code, detail, instance), {
    status,
    headers: { 'content-type': 'application/problem+json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function mapDatabaseError(error: unknown, instance?: string): Response {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('REVISION_CONFLICT')) return problemResponse(409, 'REVISION_CONFLICT', 'Answer revision conflict.', instance);
  if (message.includes('ATTEMPT_EXPIRED')) return problemResponse(409, 'ATTEMPT_EXPIRED', 'This attempt is expired.', instance);
  if (message.includes('OTP_INVALID')) return problemResponse(422, 'OTP_INVALID', 'The OTP is invalid.', instance);
  if (message.includes('OTP_EXPIRED')) return problemResponse(422, 'OTP_EXPIRED', 'The OTP has expired.', instance);
  if (message.includes('CONSENT_REQUIRED')) return problemResponse(422, 'CONSENT_REQUIRED', 'Required consent is missing.', instance);
  if (message.includes('FORBIDDEN')) return problemResponse(403, 'FORBIDDEN', 'You cannot access this attempt.', instance);
  if (message.includes('PRECONDITION_FAILED')) return problemResponse(409, 'CONTENT_NOT_PUBLISHED', 'The requested operation is not available.', instance);
  return problemResponse(500, 'INTERNAL_ERROR', 'Unexpected server error.', instance);
}
