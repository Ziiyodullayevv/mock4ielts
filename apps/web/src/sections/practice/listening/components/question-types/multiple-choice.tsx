'use client';

import type { MCQuestion } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { XCircle, CheckCircle2 } from 'lucide-react';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { REVIEW_STYLE, getReviewValueLabel } from './review-styles';
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
          const correctValues = (Array.isArray(q.answer) ? q.answer : q.answer.split(','))
            .map((value) => value.trim())
            .filter(Boolean);
          const hasAnswer = selectedValues.length > 0;
          const selectedAnswerLabel = selectedValues.join(', ');
          const correctAnswerLabel = correctValues.join(', ');
          const optionTextStyle = {
            ...getPracticeTextStyle(textSize, 'option'),
            fontSize: `${Math.max(12, textSize - 2)}px`,
            lineHeight: `${Math.max(12, textSize - 2) + 7}px`,
          };

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
              className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 space-y-2`}
            >
              <div className="flex items-start gap-2.5">
                {q.numbers && q.numbers.length > 1 ? (
                  <span
                    className={[
                      'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-2.5 text-[0.8rem] font-semibold tabular-nums tracking-[-0.03em] align-middle transition-colors',
                      isActiveQuestion
                        ? 'border border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white'
                        : 'bg-[#e8e8ec] text-stone-800 dark:bg-white/10 dark:text-white/74',
                    ].join(' ')}
                  >
                    {q.numbers[0]}/{q.numbers[q.numbers.length - 1]}
                  </span>
                ) : (
                  <QuestionNumberBadge
                    className={isActiveQuestion ? 'bg-stone-900 text-white' : undefined}
                    isActive={isActiveQuestion}
                    number={q.number}
                  />
                )}
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

              <div className="space-y-1.5">
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
                    'rounded-2xl py-1 text-stone-700 dark:text-white/78';
                  let markerClassName =
                    'border-[#dfdfdf] bg-[#dfdfdf] dark:border-white/10 dark:bg-white/8';
                  let markerValueClassName = 'text-stone-500 dark:text-white/52';

                  if (showAnswer) {
                    if (isCorrect) {
                      optionClassName = `rounded-2xl py-1 ${REVIEW_STYLE.correctRow}`;
                      markerClassName = REVIEW_STYLE.correctFill;
                      markerValueClassName = 'text-white';
                    } else if (isSelected && !isQuestionCorrect) {
                      optionClassName = `rounded-2xl py-1 ${REVIEW_STYLE.wrongRow}`;
                      markerClassName = REVIEW_STYLE.wrongFill;
                      markerValueClassName = 'text-white';
                    }
                  } else if (isSelected) {
                    optionClassName = 'rounded-2xl py-1 text-stone-900 dark:text-white';
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
                      className={`relative flex min-h-10 w-full items-center gap-2 rounded-full px-0 text-left transition-colors before:pointer-events-none before:absolute before:inset-y-[-2px] before:left-[-6px] before:right-0 before:rounded-full before:border-2 before:border-transparent focus-visible:outline-none focus-visible:before:border-sky-500/80 ${optionClassName} ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[0.74rem] font-semibold uppercase tracking-[0.04em] transition-colors ${markerClassName} ${markerValueClassName}`}
                      >
                        {opt.value}
                      </span>
                      <span className="min-w-0 flex-1">
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
                          style: optionTextStyle,
                          text: opt.text,
                        })}
                      </span>
                    </button>
                  );
                })}

                {showAnswer ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {isAnswerCorrect(answers[q.id], q.answer, q.multiSelect) ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${REVIEW_STYLE.correctBadge}`}
                      >
                        <CheckCircle2 className="size-3.5 shrink-0" strokeWidth={2.5} />
                        Correct
                      </span>
                    ) : (
                      <>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${REVIEW_STYLE.wrongBadge}`}
                        >
                          <XCircle className="size-3.5 shrink-0" strokeWidth={2.5} />
                          {hasAnswer
                            ? getReviewValueLabel(selectedAnswerLabel)
                            : 'No answer'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${REVIEW_STYLE.correctBadge}`}
                        >
                          <CheckCircle2 className="size-3.5 shrink-0" strokeWidth={2.5} />
                          Correct: {correctAnswerLabel}
                        </span>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </PaperPanel>
  );
}
