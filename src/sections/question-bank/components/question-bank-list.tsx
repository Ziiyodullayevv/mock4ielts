import type { QuestionBankItem } from '../types';

import { QuestionBankRow } from './question-bank-row';
import { QuestionBankEmptyState } from './question-bank-empty-state';

type QuestionBankListProps = {
  items: QuestionBankItem[];
};

export function QuestionBankList({ items }: QuestionBankListProps) {
  if (!items.length) {
    return <QuestionBankEmptyState />;
  }

  return (
    <div className="space-y-1.5 sm:space-y-0">
      {items.map((item, index) => (
        <QuestionBankRow key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
