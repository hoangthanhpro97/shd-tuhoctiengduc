import { describe, expect, it } from 'vitest';
import { getRoleDefinition } from '../src/index.js';

describe('DB Package', () => {
  it('only shd_migrator has canRunDdl = true', () => {
    expect(getRoleDefinition('shd_migrator').canRunDdl).toBe(true);
    expect(getRoleDefinition('shd_app').canRunDdl).toBe(false);
    expect(getRoleDefinition('shd_grader').canRunDdl).toBe(false);
  });
});
