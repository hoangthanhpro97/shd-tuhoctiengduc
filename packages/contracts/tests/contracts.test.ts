import { describe, expect, it } from 'vitest';
import { createProblemDetails } from '../src/index.js';

describe('Contracts Package', () => {
  it('creates RFC 7807 problem details object', () => {
    const err = createProblemDetails(400, 'Bad Request', 'Invalid payload');
    expect(err.status).toBe(400);
    expect(err.title).toBe('Bad Request');
    expect(err.detail).toBe('Invalid payload');
  });
});
