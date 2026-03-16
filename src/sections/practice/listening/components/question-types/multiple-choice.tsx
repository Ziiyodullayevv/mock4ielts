'use client';

import type { MCQuestion } from '../../types';

import { getListeningQuestionAnchorId } from '../../utils';
import { PaperPanel, PAPER_ROW_CLASS_NAME } from './paper-shell';

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
      <div className="divide-y divide-white/65">
        {questions.map((q) => {
          const isActiveQuestion = q.id === activeQuestionId;
          const selectedValues = (answers[q.id] ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
          const correctValues = q.answer
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
              className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 space-y-5`}
            >
              <p className="text-[1.15rem] leading-9 text-stone-800">
                <span
                  className={`mr-2 font-semibold ${
                    isActiveQuestion ? 'text-blue-600' : 'text-stone-800'
                  }`}
                >
                  {q.number})
                </span>
                {q.text}
              </p>

              <div className="space-y-3 pl-1">
                {q.multiSelect && q.selectCount ? (
                  <p className="text-sm font-medium uppercase tracking-[0.12em] text-stone-500">
                    Select {q.selectCount}
                  </p>
                ) : null}

                {q.options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const isCorrect = correctValues.includes(opt.value);
                  let optionClassName =
                    'bg-white/55 text-stone-700 hover:bg-white';
                  let markerClassName =
                    'border-stone-300 bg-transparent text-stone-500';

                  if (showAnswer) {
                    if (isCorrect) {
                      optionClassName = 'bg-green-50 text-green-800';
                      markerClassName = 'border-green-600 bg-green-600 text-white';
                    } else if (isSelected) {
                      optionClassName = 'bg-red-50 text-red-700';
                      markerClassName = 'border-red-500 bg-red-500 text-white';
                    }
                  } else if (isSelected) {
                    optionClassName = 'bg-white text-stone-900';
                    markerClassName = 'border-stone-900 bg-stone-900 text-white';
                  }

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      disabled={showAnswer}
                      aria-pressed={isSelected}
                      className={`flex w-full items-start gap-4 px-4 py-4 text-left text-[1.02rem] leading-8 transition-colors ${optionClassName} ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center border text-[0.72rem] font-semibold transition-colors ${markerClassName}`}
                      >
                        {opt.value}
                      </span>
                      <span>{opt.text}</span>
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
