'use client';

import type { MCQuestion } from '../../types';

import { isAnswerCorrect, getListeningQuestionAnchorId } from '../../utils';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  questions: MCQuestion[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function MultipleChoice({
  activeQuestionId,
  questions,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel title="Questions">
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {questions.map((q) => {
          const isActiveQuestion = q.id === activeQuestionId;
          const selectedValues = (answers[q.id] ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
          const correctAnswer = Array.isArray(q.answer) ? q.answer[0] ?? '' : q.answer;
          const correctValues = correctAnswer
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);

          const handleSelect = (optionValue: string) => {
            if (showAnswer) {
              return;
            }

            if (!q.multiSelect) {
              onChange(q.id, optionValue);
              return;
            }

            const isSelected = selectedValues.includes(optionValue);
            const nextValues = isSelected
              ? selectedValues.filter((value) => value !== optionValue)
              : [...selectedValues, optionValue];

            if (!isSelected && q.selectCount && nextValues.length > q.selectCount) {
              return;
            }

            const orderedValues = q.options
              .map((option) => option.value)
              .filter((value) => nextValues.includes(value));

            onChange(q.id, orderedValues.join(','));
          };

          return (
            <section
              key={q.id}
              id={getListeningQuestionAnchorId(q.id)}
              className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 space-y-4 !py-4 sm:!py-5`}
            >
              <div className="flex items-start gap-2.5">
                <QuestionNumberBadge
                  className={isActiveQuestion ? 'bg-stone-900 text-white' : undefined}
                  isActive={isActiveQuestion}
                  number={q.number}
                />
                <p className="min-w-0 flex-1 pt-0.5 text-[1.08rem] leading-8 text-stone-800">
                  {q.text}
                </p>
              </div>

              <div className="space-y-2 pl-1">
                {q.multiSelect && q.selectCount ? (
                  <p className="text-[0.82rem] font-medium uppercase tracking-[0.12em] text-stone-500">
                    Select {q.selectCount}
                  </p>
                ) : null}

                {q.options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const isCorrect = correctValues.includes(opt.value);
                  const isQuestionCorrect = isAnswerCorrect(answers[q.id], q.answer, q.multiSelect);
                  let optionClassName =
                    'rounded-2xl py-1.5 text-stone-700';
                  let markerClassName =
                    'border-[#dfdfdf] bg-[#dfdfdf]';
                  let markerValueClassName = 'text-stone-500';

                  if (showAnswer) {
                    if (isCorrect) {
                      optionClassName = 'rounded-2xl bg-green-50/80 py-1.5 text-green-800';
                      markerClassName = 'border-green-600 bg-green-600';
                      markerValueClassName = 'text-white';
                    } else if (isSelected && !isQuestionCorrect) {
                      optionClassName = 'rounded-2xl bg-red-50/80 py-1.5 text-red-700';
                      markerClassName = 'border-red-500 bg-red-500';
                      markerValueClassName = 'text-white';
                    }
                  } else if (isSelected) {
                    optionClassName = 'rounded-2xl py-1.5 text-stone-900';
                    markerClassName = 'border-blue-600 bg-blue-600';
                    markerValueClassName = 'text-white';
                  }

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      disabled={showAnswer}
                      aria-pressed={isSelected}
                      className={`flex w-full items-start gap-3 text-left text-[1rem] leading-7 transition-colors ${optionClassName} ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[0.92rem] font-semibold uppercase tracking-[0.04em] transition-colors ${markerClassName} ${markerValueClassName}`}
                      >
                        {opt.value}
                      </span>
                      <span className="min-w-0 flex-1 pt-1">
                        <span>{opt.text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PaperPanel>
  );
}
