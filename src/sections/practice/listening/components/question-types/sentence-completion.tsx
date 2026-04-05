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

export function SentenceCompletion({
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
            className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-wrap items-start gap-2 text-[1.05rem] leading-9`}
          >
            <QuestionNumberBadge
              isActive={q.id === activeQuestionId}
              number={q.number}
              className="mt-0.5"
            />
            <span className="flex flex-wrap items-center gap-1.5 text-stone-800">
              {q.label}
              <CompletionInput
                field={q}
                value={answers[q.id] ?? ''}
                onChange={onChange}
                showAnswer={showAnswer}
              />
            </span>
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
