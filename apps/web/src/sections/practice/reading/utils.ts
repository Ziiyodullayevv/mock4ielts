import type { Answers, TestResult , ReadingPart, ReadingTest } from './types';

import {
  getGroupIds,
  isAnswerCorrect,
  getPrimaryAnswer,
  getGroupQuestions,
  type PartQuestionMeta,
  getListeningQuestionAnchorId,
  countTotal as countListeningTotal,
  countAnswered as countListeningAnswered,
  computeResult as computeListeningResult,
  getPartQuestions as getListeningPartQuestions,
  countPartAnswered as countListeningPartAnswered,
  getCorrectAnswers as getListeningCorrectAnswers,
  getPartQuestionIds as getListeningPartQuestionIds,
} from '../listening/utils';

export type { PartQuestionMeta } from '../listening/utils';
export { getGroupIds, isAnswerCorrect, getPrimaryAnswer, getGroupQuestions, getListeningQuestionAnchorId };

export function computeResult(test: ReadingTest, answers: Answers): TestResult {
  return computeListeningResult(test, answers);
}

export function getCorrectAnswers(test: ReadingTest) {
  return getListeningCorrectAnswers(test);
}

export function getPartQuestionIds(part: ReadingPart) {
  return getListeningPartQuestionIds(part);
}

export function getPartQuestions(part: ReadingPart): PartQuestionMeta[] {
  return getListeningPartQuestions(part);
}

export function countPartAnswered(part: ReadingPart, answers: Answers) {
  return countListeningPartAnswered(part, answers);
}

export function countAnswered(test: ReadingTest, answers: Answers) {
  return countListeningAnswered(test, answers);
}

export function countTotal(test: ReadingTest) {
  return countListeningTotal(test);
}
