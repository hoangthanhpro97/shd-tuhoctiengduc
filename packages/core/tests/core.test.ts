import { describe, expect, it } from 'vitest';
import { createExamMetadata } from '../src/index.js';

describe('Core Package', () => {
  it('creates exam metadata correctly', () => {
    const meta = createExamMetadata('uuid-1', 'TELC B1 Test 02', 'telc', 'b1');
    expect(meta.id).toBe('uuid-1');
    expect(meta.title).toBe('TELC B1 Test 02');
  });
});

