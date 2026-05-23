'use client';

import type { MatchingData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { X, Check } from 'lucide-react';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from '@/src/components/ui/select';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { getListeningQuestionAnchorId } from '../../utils';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import {
  PaperPanel,
  PaperSurface,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  data: MatchingData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function Matching({
  activeQuestionId,
  annotationBlockIdPrefix,
  data,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  const handleRemove = (pairId: string) => {
    if (!showAnswer) onChange(pairId, '');
  };

  return (
    <div className="space-y-5">
      <PaperSurface>
        <div className="flex flex-wrap gap-2.5 p-3 sm:p-3.5 md:p-4">
          {data.options.map((opt) => {
            const [value, ...labelParts] = opt.label.split(/\s+/);

            return (
              <button
                key={opt.value}
                type="button"
                style={getPracticeTextStyle(textSize, 'option')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[0.95rem] leading-5 text-stone-700 transition-all dark:bg-white/8 dark:text-white/78"
              >
                <span className="font-semibold">
                  {value}
                </span>
                <span className="whitespace-nowrap">
                  {renderQuestionText({
                    as: 'span',
                    blockId: getQuestionAnnotationBlockId(
                      annotationBlockIdPrefix,
                      'option',
                      opt.value,
                      'label'
                    ),
                    renderAnnotatedTextBlock,
                    text: labelParts.join(' '),
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </PaperSurface>

      <PaperPanel
        title="Questions"
        titleClassName="px-5 py-4 sm:px-6"
        titleContent={renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
          renderAnnotatedTextBlock,
          text: 'Questions',
        })}
      >
        <div className={PAPER_DIVIDER_CLASS_NAME}>
          {data.pairs.map((pair) => {
            const val = answers[pair.id] ?? '';
            const isActiveQuestion = pair.id === activeQuestionId;
            const isCorrect = showAnswer ? val === pair.answer : undefined;
            const correctLabel = data.options.find((o) => o.value === pair.answer)?.label ?? '';
            const selectedOption = data.options.find((o) => o.value === val);
            const selectedLabel = selectedOption
              ? selectedOption.label.split(/\s+/).slice(1).join(' ')
              : '';
            let dropChipClassName =
              'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-400 bg-sky-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-800 whitespace-nowrap shadow-[inset_0_0_0_1px_rgba(125,211,252,0.45)] transition-colors';

            if (showAnswer) {
              dropChipClassName = isCorrect
                ? 'inline-flex min-h-8 items-center gap-2 rounded-sm border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-green-700 transition-colors'
                : 'inline-flex min-h-8 items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-red-600 transition-colors';
            } else if (val) {
              dropChipClassName = isActiveQuestion
                ? 'inline-flex min-h-8 items-center gap-2 rounded-sm border border-sky-400 bg-sky-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sky-700 shadow-[0_0_0_1px_rgba(56,189,248,0.12)] transition-colors'
                : 'inline-flex min-h-8 items-center gap-2 rounded-sm border border-stone-300 bg-[#f7f7f7] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-stone-800 transition-colors dark:border-white/10 dark:bg-white/8 dark:text-white/78';
            } else if (isActiveQuestion) {
              dropChipClassName =
                'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-500 bg-sky-200 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-900 whitespace-nowrap shadow-[0_0_0_1px_rgba(56,189,248,0.16)] transition-colors';
            }

            return (
              <div
                key={pair.id}
                id={getListeningQuestionAnchorId(pair.id)}
                className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between`}
              >
                <div
                  style={getPracticeTextStyle(textSize, 'body')}
                  className="flex max-w-3xl items-start gap-3 text-stone-800 dark:text-white/84"
                >
                  <QuestionNumberBadge isActive={isActiveQuestion} number={pair.number} />
                  {renderQuestionText({
                    as: 'span',
                    blockId: getQuestionAnnotationBlockId(
                      annotationBlockIdPrefix,
                      'pair',
                      pair.id,
                      'text'
                    ),
                    className: 'min-w-0 flex-1',
                    renderAnnotatedTextBlock,
                    text: pair.text,
                  })}
                </div>

                <div className="w-full max-w-sm space-y-1.5 lg:flex lg:flex-col lg:items-end">
                  {showAnswer ? (
                    <div className={dropChipClassName}>
                      {val ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tracking-[0.08em] text-inherit">{val}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-current opacity-70" />
                          <span>NO ANSWER</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex w-full max-w-sm items-center gap-2 lg:justify-end">
                      <Select
                        value={val || undefined}
                        onValueChange={(nextValue) =>
                          onChange(pair.id, nextValue === '__clear__' ? '' : nextValue)
                        }
                      >
                        <SelectTrigger
                          data-question-focus="true"
                          style={getPracticeTextStyle(textSize, 'body-compact')}
                          className={`min-h-11 rounded-xl border px-3 py-2 text-left shadow-none ${
                            isActiveQuestion
                              ? 'border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-400/70 dark:bg-sky-500/12 dark:text-sky-100'
                              : 'border-stone-300 bg-[#f7f7f7] text-stone-800 dark:border-white/10 dark:bg-white/8 dark:text-white/78'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {val ? (
                              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold tracking-[0.08em] text-white dark:bg-white/90 dark:text-stone-950">
                                {val}
                              </span>
                            ) : (
                              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/14 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200">
                                <Check className="size-3" strokeWidth={2.6} />
                              </span>
                            )}
                            <span className="truncate">
                              {selectedLabel || 'Select answer'}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-300 dark:border-white/10">
                          <SelectItem value="__clear__" className="rounded-lg text-stone-500 dark:text-white/52">
                            Clear selection
                          </SelectItem>
                          {data.options.map((option) => {
                            const [, ...labelParts] = option.label.split(/\s+/);

                            return (
                              <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                <span className="inline-flex items-center gap-2">
                                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold tracking-[0.08em] text-white dark:bg-white/90 dark:text-stone-950">
                                    {option.value}
                                  </span>
                                  <span className="truncate">{labelParts.join(' ') || option.label}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {val ? (
                        <button
                          type="button"
                          onClick={() => handleRemove(pair.id)}
                          aria-label={`Clear answer for question ${pair.number}`}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-[#f7f7f7] text-stone-500 transition-colors hover:border-red-300 hover:text-red-500 dark:border-white/10 dark:bg-white/8 dark:text-white/34 dark:hover:border-red-400/40 dark:hover:text-red-300"
                        >
                          <X className="size-4" strokeWidth={2.2} />
                        </button>
                      ) : null}
                    </div>
                  )}

                  {showAnswer && !isCorrect ? (
                    <p className="text-sm font-medium text-green-700">✓ {correctLabel}</p>
                  ) : null}

                  {!showAnswer && val ? (
                    <p className="text-xs text-stone-500 dark:text-white/42">{selectedLabel}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </PaperPanel>
    </div>
  );
}
