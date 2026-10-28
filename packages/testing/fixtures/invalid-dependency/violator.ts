// Fixture representing an illegal import from core (or fixture representing core) to adapters
import { MockZnsAdapter } from '../../../adapters/src/index.js';

export const invalidInstance = new MockZnsAdapter();
