import type { TestResult } from '../types';

import { ScoreSummaryView } from '../view/score-summary-view';

type Props = {
  result: TestResult;
};

export function ScoreSummary({ result }: Props) {
  return <ScoreSummaryView result={result} />;
}
