import { describe, expect, it } from 'vitest';
import { MockZnsAdapter } from '../src/index.js';

describe('Adapters Package', () => {
  it('sends mock ZNS message successfully', async () => {
    const adapter = new MockZnsAdapter();
    const res = await adapter.sendZns('0912345678', 'tpl_under18');
    expect(res).toBe(true);
  });
});
