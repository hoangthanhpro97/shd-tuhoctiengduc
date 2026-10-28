import { describe, expect, it } from 'vitest';
import { getBaseConfig } from '../src/index.js';

describe('Config Package', () => {
  it('returns default config when env is empty', () => {
    const cfg = getBaseConfig();
    expect(cfg).toBeDefined();
    expect(typeof cfg.port).toBe('number');
  });
});

