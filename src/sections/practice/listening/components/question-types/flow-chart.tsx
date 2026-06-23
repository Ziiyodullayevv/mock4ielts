'use client';

import type { FlowStep } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { X } from 'lucide-react';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from '@/src/components/ui/select';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  chartTitle: string;
  steps: FlowStep[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function FlowChart({
  activeQuestionId,
  annotationBlockIdPrefix,
  chartTitle,
  steps,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel
      title={chartTitle}
      titleContent={renderQuestionText({
        as: 'span',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
        renderAnnotatedTextBlock,
        text: chartTitle,
      })}
    >
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {steps.map((step, i) => {
          const isActiveQuestion = step.id === activeQuestionId;

          if (!step.isBlank && step.content === '↓') {
            return (
              <div key={i} className="flex justify-center px-4 py-2 text-xl text-stone-500 dark:text-white/36 sm:px-6">
                <span aria-hidden="true">↓</span>
              </div>
            );
          }

          if (step.isBlank) {
            const val = answers[step.id!] ?? '';
            const isCorrect = showAnswer
              ? val.toUpperCase() === String(step.answer).toUpperCase()
              : undefined;
            const selectedOption = step.selectOptions?.find((o) => o.value === val);

            const selectInput = step.selectOptions ? (
              <span className="inline-flex items-center gap-1.5 align-middle">
                {showAnswer ? (
                  <span
                    className={[
                      'inline-flex min-h-8 items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
                      isCorrect
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-red-300 bg-red-50 text-red-600',
                    ].join(' ')}
                  >
                    {val || <span className="opacity-60">NO ANSWER</span>}
                  </span>
                ) : (
                  <>
                    <Select
                      value={val || undefined}
                      onValueChange={(v) => onChange(step.id!, v === '__clear__' ? '' : v)}
                    >
                      <SelectTrigger
                        data-question-focus="true"
                        style={getPracticeTextStyle(textSize, 'body-compact')}
                        className={[
                          'min-h-9 rounded-xl border px-3 py-1.5 text-left shadow-none',
                          isActiveQuestion
                            ? 'border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-400/70 dark:bg-sky-500/12 dark:text-sky-100'
                            : 'border-stone-300 bg-[#f7f7f7] text-stone-800 dark:border-white/10 dark:bg-white/8 dark:text-white/78',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          {val && (
                            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white dark:bg-white/90 dark:text-stone-950">
                              {val}
                            </span>
                          )}
                          <span className="truncate">
                            {selectedOption ? selectedOption.text : 'Select answer'}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="w-[min(34rem,calc(100vw-2rem))] rounded-xl border-stone-300 dark:border-white/10">
                        <SelectItem value="__clear__" className="rounded-lg text-stone-500 dark:text-white/52">
                          Clear selection
                        </SelectItem>
                        {step.selectOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="rounded-lg pr-9">
                            <span className="flex min-w-0 items-start gap-2">
                              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white dark:bg-white/90 dark:text-stone-950">
                                {opt.value}
                              </span>
                              <span className="min-w-0 whitespace-normal break-words leading-6">
                                {opt.text}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {val && (
                      <button
                        type="button"
                        onClick={() => onChange(step.id!, '')}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-[#f7f7f7] text-stone-500 transition-colors hover:border-red-300 hover:text-red-500 dark:border-white/10 dark:bg-white/8"
                      >
                        <X className="size-3.5" strokeWidth={2.2} />
                      </button>
                    )}
                  </>
                )}
                {showAnswer && !isCorrect && (
                  <span className="text-xs font-medium text-green-700">
                    ✓ {String(step.answer)}
                  </span>
                )}
              </span>
            ) : null;

            return (
              <div
                key={i}
                id={getListeningQuestionAnchorId(step.id!)}
                className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28`}
              >
                <div
                  style={getPracticeTextStyle(textSize, 'body')}
                  className="mx-auto max-w-2xl text-center text-stone-800 dark:text-white/84"
                >
                  <QuestionNumberBadge
                    isActive={isActiveQuestion}
                    number={step.number!}
                    size="xs"
                    className="mr-1.5"
                  />
                  {step.content ? (
                    step.content.split('_______').map((part, pi, arr) => (
                      <span key={pi}>
                        {part
                          ? renderQuestionText({
                              as: 'span',
                              blockId: getQuestionAnnotationBlockId(
                                annotationBlockIdPrefix,
                                'step',
                                i,
                                'segment',
                                pi
                              ),
                              renderAnnotatedTextBlock,
                              text: part,
                            })
                          : null}
                        {pi < arr.length - 1 && (
                          selectInput ?? (
                            <CompletionInput
                              annotationBlockIdPrefix={annotationBlockIdPrefix}
                              field={{
                                id: step.id!,
                                number: step.number!,
                                label: '',
                                answerLength: step.answerLength!,
                                answer: step.answer!,
                              }}
                              value={val}
                              onChange={onChange}
                              renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                              showAnswer={showAnswer}
                            />
                          )
                        )}
                      </span>
                    ))
                  ) : (
                    selectInput ?? (
                      <CompletionInput
                        annotationBlockIdPrefix={annotationBlockIdPrefix}
                        field={{
                          id: step.id!,
                          number: step.number!,
                          label: '',
                          answerLength: step.answerLength!,
                          answer: step.answer!,
                        }}
                        value={val}
                        onChange={onChange}
                        renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                        showAnswer={showAnswer}
                      />
                    )
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={PAPER_ROW_CLASS_NAME}>
              <div
                style={getPracticeTextStyle(textSize, 'body')}
                className="mx-auto max-w-2xl text-center text-stone-800 dark:text-white/84"
              >
                {step.content
                  ? renderQuestionText({
                      as: 'span',
                      blockId: getQuestionAnnotationBlockId(
                        annotationBlockIdPrefix,
                        'step',
                        i,
                        'text'
                      ),
                      renderAnnotatedTextBlock,
                      text: step.content,
                    })
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </PaperPanel>
  );
}
