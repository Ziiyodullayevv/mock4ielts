'use client';

import type { TestResult } from '@/src/sections/practice/listening/types';

import { ScoreSummaryView } from '@/src/sections/practice/listening/view/score-summary-view';

type PracticeScoreSummaryProps = {
  result: TestResult;
};

export function PracticeScoreSummary({ result }: PracticeScoreSummaryProps) {
  return <ScoreSummaryView result={result} />;
}
