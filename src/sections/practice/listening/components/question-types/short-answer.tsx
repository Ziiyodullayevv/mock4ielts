'use client';

import type { BlankField } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  questions: BlankField[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function ShortAnswer({
  activeQuestionId,
  questions,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel>
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {questions.map((q) => (
          <div
            key={q.id}
            id={getListeningQuestionAnchorId(q.id)}
            className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 space-y-3`}
          >
            <div className="flex items-start gap-3">
              <QuestionNumberBadge isActive={q.id === activeQuestionId} number={q.number} />
              <p className="min-w-0 flex-1 pt-0.5 text-[1.05rem] leading-9 text-stone-800">
                {q.label}
              </p>
            </div>
            <CompletionInput
              field={{ ...q, label: '' }}
              value={answers[q.id] ?? ''}
              onChange={onChange}
              showAnswer={showAnswer}
            />
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
