import type { Answers , ReadingTest } from '../types';

import {
  startListeningSectionAttempt,
  submitListeningSectionAttempt,
  getListeningSectionAttemptResult,
} from '../../listening/api/listening-attempt-api';

export const startReadingSectionAttempt = startListeningSectionAttempt;

export async function getReadingSectionAttemptResult(params: {
  attemptId: string;
  sectionId: string;
  test: ReadingTest;
}) {
  return getListeningSectionAttemptResult(params);
}

export async function submitReadingSectionAttempt(params: {
  answers: Answers;
  attemptId: string;
  sectionId: string;
  test: ReadingTest;
}) {
  return submitListeningSectionAttempt(params);
}
