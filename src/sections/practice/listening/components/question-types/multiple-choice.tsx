'use client';

import type { MCQuestion } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { isAnswerCorrect, getListeningQuestionAnchorId } from '../../utils';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  questions: MCQuestion[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function MultipleChoice({
  activeQuestionId,
  annotationBlockIdPrefix,
  questions,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel
      title="Questions"
      titleContent={renderQuestionText({
        as: 'span',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
        renderAnnotatedTextBlock,
        text: 'Questions',
      })}
    >
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
                {renderQuestionText({
                  as: 'p',
                  blockId: getQuestionAnnotationBlockId(
                    annotationBlockIdPrefix,
                    'question',
                    q.id,
                    'text'
                  ),
                  className: 'min-w-0 flex-1 pt-0.5 text-stone-800 dark:text-white/84',
                  renderAnnotatedTextBlock,
                  style: getPracticeTextStyle(textSize, 'body'),
                  text: q.text,
                })}
              </div>

              <div className="space-y-2 pl-1">
                {q.multiSelect && q.selectCount ? (
                  renderQuestionText({
                    as: 'p',
                    blockId: getQuestionAnnotationBlockId(
                      annotationBlockIdPrefix,
                      'question',
                      q.id,
                      'select-label'
                    ),
                    className: 'font-medium uppercase tracking-[0.12em] text-stone-500 dark:text-white/42',
                    renderAnnotatedTextBlock,
                    style: getPracticeTextStyle(textSize, 'label'),
                    text: `Select ${q.selectCount}`,
                  })
                ) : null}

                {q.options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const isCorrect = correctValues.includes(opt.value);
                  const isQuestionCorrect = isAnswerCorrect(answers[q.id], q.answer, q.multiSelect);
                  let optionClassName =
                    'rounded-2xl py-1.5 text-stone-700 dark:text-white/78';
                  let markerClassName =
                    'border-[#dfdfdf] bg-[#dfdfdf] dark:border-white/10 dark:bg-white/8';
                  let markerValueClassName = 'text-stone-500 dark:text-white/52';

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
                    optionClassName = 'rounded-2xl py-1.5 text-stone-900 dark:text-white';
                    markerClassName = 'border-blue-600 bg-blue-600';
                    markerValueClassName = 'text-white';
                  }

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (window.getSelection()?.toString().trim()) {
                          return;
                        }

                        handleSelect(opt.value);
                      }}
                      disabled={showAnswer}
                      aria-pressed={isSelected}
                      style={getPracticeTextStyle(textSize, 'option')}
                      className={`flex w-full items-start gap-3 text-left transition-colors ${optionClassName} ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[0.92rem] font-semibold uppercase tracking-[0.04em] transition-colors ${markerClassName} ${markerValueClassName}`}
                      >
                        {opt.value}
                      </span>
                      <span className="min-w-0 flex-1 pt-1">
                        {renderQuestionText({
                          as: 'span',
                          blockId: getQuestionAnnotationBlockId(
                            annotationBlockIdPrefix,
                            'question',
                            q.id,
                            'option',
                            opt.value
                          ),
                          renderAnnotatedTextBlock,
                          text: opt.text,
                        })}
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
