import type { Answers, TestResult, ReadingPart, ReadingTest } from '../types';

import {
  startListeningSectionAttempt,
  submitListeningSectionAttempt,
  getListeningSectionAttemptResult,
} from '../../listening/api/listening-attempt-api';

type ReadingSubmitResult = {
  result: TestResult;
  reviewTest: ReadingTest;
};

export const startReadingSectionAttempt = startListeningSectionAttempt;

 
function toReadingTest(listeningTest: any, originalTest: ReadingTest): ReadingTest {
  const parts: ReadingPart[] = (listeningTest.parts ?? []).map(
    (part: ReadingPart, index: number) => ({
      ...part,
      passageText: originalTest.parts[index]?.passageText ?? '',
    })
  );
  return { ...listeningTest, parts };
}

export async function getReadingSectionAttemptResult(params: {
  attemptId: string;
  sectionId: string;
  test: ReadingTest;
}): Promise<ReadingSubmitResult | null> {
  const result = await getListeningSectionAttemptResult(params);
  if (!result) return null;
  return {
    result: result.result,
    reviewTest: toReadingTest(result.reviewTest, params.test),
  };
}

export async function submitReadingSectionAttempt(params: {
  answers: Answers;
  attemptId: string;
  sectionId: string;
  test: ReadingTest;
}): Promise<ReadingSubmitResult> {
  const result = await submitListeningSectionAttempt(params);
  return {
    result: result.result,
    reviewTest: toReadingTest(result.reviewTest, params.test),
  };
}
