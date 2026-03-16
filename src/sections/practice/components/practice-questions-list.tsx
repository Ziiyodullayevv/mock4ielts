import type { PracticeQuestionItem } from '../types';

import { PracticeQuestionRow } from './practice-question-row';

type PracticeQuestionsListProps = {
  animationSeed?: number;
  animateRows?: boolean;
  items: PracticeQuestionItem[];
};

export function PracticeQuestionsList({
  animationSeed = 0,
  animateRows = false,
  items,
}: PracticeQuestionsListProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item, index) => (
        <PracticeQuestionRow
          key={`${item.id}-${animationSeed}`}
          item={item}
          index={index}
          enableEntranceAnimation={animateRows}
          animationDelayMs={Math.min(index, 12) * 28}
        />
      ))}
    </div>
  );
}
