import type { ListeningTest } from '../types';

import { test1 } from './test-1';
import { test2 } from './test-2';
import { test3 } from './test-3';
import { test4 } from './test-4';
import { test5 } from './text-5';

export const tests: ListeningTest[] = [test1, test2, test3, test4, test5];

export function getListeningTestById(id: string) {
  return tests.find((test) => test.id === id);
}

export { test1, test2, test3, test4, test5 };

export * from './listening-practice.data';
