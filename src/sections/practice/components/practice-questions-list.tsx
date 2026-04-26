import type { PracticeQuestionItem } from '../types';

import { PracticeQuestionRow } from './practice-question-row';

type PracticeQuestionsListProps = {
  animationSeed?: number;
  animateRows?: boolean;
  items: PracticeQuestionItem[];
  openItemHref?: string | null;
  openRequestId?: number;
};

export function PracticeQuestionsList({
  animationSeed = 0,
  animateRows = false,
  items,
  openItemHref = null,
  openRequestId = 0,
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
          shouldOpenInfo={item.href === openItemHref}
          openRequestId={openRequestId}
        />
      ))}
    </div>
  );
}
