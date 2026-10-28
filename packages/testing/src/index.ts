export function createTestUuid(index: number): string {
  return `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
}

