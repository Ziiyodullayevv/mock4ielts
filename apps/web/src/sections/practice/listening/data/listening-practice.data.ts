import type { PracticeOverview, PracticeQuestionItem } from '../../types';

import { paths } from '@/src/routes/paths';

import { test1 } from './test-1';
import { test2 } from './test-2';
import { test3 } from './test-3';
import { test4 } from './test-4';
import { test5 } from './text-5';
import { countTotal } from '../utils';

const demoTests = [test1, test2, test3, test4, test5];
const attemptCounts = [12400, 9100, 7600, 6200, 5400];
const totalDemoQuestions = demoTests.reduce((total, test) => total + countTotal(test), 0);

export const LISTENING_PRACTICE_OVERVIEW: PracticeOverview = {
  avgBandScore: 7.5,
  savedCount: 8079,
  sourceLabel: 'Mock4IELTS',
  title: 'Listening',
  totalAttempting: demoTests.length,
  totalQuestions: totalDemoQuestions,
  totalSolved: 0,
  updatedAtLabel: '10 hours ago',
};

export const LISTENING_PRACTICE_QUESTIONS: PracticeQuestionItem[] = demoTests.map((test, index) => ({
  attemptCount: attemptCounts[index] ?? 5000,
  href: paths.practice.listening.details(test.id),
  id: index + 1,
  isStarred: true,
  tokenCost: 8,
  title: test.title,
}));
