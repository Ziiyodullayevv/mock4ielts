'use client';

import type { MatchingData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { useState } from 'react';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { useDragAutoScroll } from './use-drag-auto-scroll';
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
  const [dragging, setDragging] = useState<string | null>(null);

  useDragAutoScroll(Boolean(dragging) && !showAnswer);

  const handleDrop = (pairId: string, optionValue: string) => {
    // If this pair already had an answer, free it first
    const existing = answers[pairId];
    if (existing) onChange(pairId, '');
    onChange(pairId, optionValue);
    setDragging(null);
  };

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
                draggable={!showAnswer}
                onDragStart={() => setDragging(opt.value)}
                onDragEnd={() => setDragging(null)}
                style={getPracticeTextStyle(textSize, 'option')}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.95rem] leading-5 transition-all ${
                  showAnswer
                    ? 'bg-white text-stone-700 dark:bg-white/8 dark:text-white/78'
                    : dragging === opt.value
                      ? 'cursor-grabbing bg-stone-900 text-white opacity-60'
                      : 'cursor-grab bg-white text-stone-700 dark:bg-white/8 dark:text-white/78'
                }`}
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

            if (!showAnswer && dragging && !val) {
              dropChipClassName =
                'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-sky-600 bg-sky-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-sky-950 whitespace-nowrap shadow-[0_0_0_4px_rgba(56,189,248,0.14)] transition-all';
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
                  <div
                    data-question-focus={!showAnswer ? 'true' : undefined}
                    tabIndex={showAnswer ? -1 : 0}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dragging && handleDrop(pair.id, dragging)}
                    className={dropChipClassName}
                  >
                    {val ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tracking-[0.08em] text-inherit">{val}</span>
                        {!showAnswer ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(pair.id)}
                            className="text-stone-400 transition-colors hover:text-red-500 dark:text-white/34"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-current opacity-70" />
                        <span>DROP HERE</span>
                      </span>
                    )}
                  </div>

                  {showAnswer && !isCorrect ? (
                    <p className="text-sm font-medium text-green-700">✓ {correctLabel}</p>
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
