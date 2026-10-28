import { describe, expect, it } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

describe('Architecture & Dependency Invariant Rules', () => {
  it('dependency-cruiser blocks forbidden import (core -> adapters)', () => {
    const fixturePath = path.resolve('packages/testing/fixtures/invalid-dependency/violator.ts');
    let errorCaught = false;
    let output = '';
    try {
      execSync(`pnpm exec depcruise --config .dependency-cruiser.cjs "${fixturePath}"`, {
        stdio: 'pipe',
      });
    } catch (err: unknown) {
      errorCaught = true;
      const execErr = err as { stdout?: Buffer; stderr?: Buffer };
      output = (execErr.stdout?.toString() || '') + (execErr.stderr?.toString() || '');
    }
    expect(errorCaught).toBe(true);
    expect(output).toContain('core-no-import-adapters-or-apps');
  });
});
